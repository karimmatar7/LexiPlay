import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supaBaseClient";
import { updateParentalControl } from "../supabaseFunctions";

export default function usePlaytimeTracker(user) {
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const playtimeRef = useRef(0);
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    if (!user?.id) return;

    const loadPlaytime = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("parental_control")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error loading parental control:", error);
        return;
      }

      const pc = data?.parental_control || {};

      // Only proceed if parental control is enabled
      if (!pc.enabled) return;

      const today = new Date().toISOString().slice(0, 10);
      let playtimeToday = pc.playtimeToday || 0;
      const dailyLimitMinutes = pc.dailyLimitMinutes || 60;

      // Reset if new day
      if (pc.lastPlayedDate !== today) {
        playtimeToday = 0;
        await updateParentalControl(user.id, {
          playtimeToday: 0,
          lastPlayedDate: today,
        });
      }

      playtimeRef.current = playtimeToday;

      // Check if limit already reached
      const remainingSeconds = Math.max(dailyLimitMinutes * 60 - playtimeToday, 0);
      if (remainingSeconds <= 0 && !hasNavigatedRef.current) {
        hasNavigatedRef.current = true;
        navigate("/menu", { state: { limitReached: true }, replace: true });
        return;
      }

      // Start tracking playtime
      timerRef.current = setInterval(async () => {
        playtimeRef.current += 1;
        const newRemaining = dailyLimitMinutes * 60 - playtimeRef.current;

        if (newRemaining <= 0 && !hasNavigatedRef.current) {
          hasNavigatedRef.current = true;
          clearInterval(timerRef.current);
          await updateParentalControl(user.id, {
            playtimeToday: playtimeRef.current,
            lastPlayedDate: today,
          });
          navigate("/menu", { state: { limitReached: true }, replace: true });
        } else if (playtimeRef.current % 5 === 0) {
          // Save to database every 5 seconds
          await updateParentalControl(user.id, {
            playtimeToday: playtimeRef.current,
            lastPlayedDate: today,
          });
        }
      }, 1000);
    };

    loadPlaytime();

    return () => {
      // Save final playtime when unmounting
      if (timerRef.current) {
        clearInterval(timerRef.current);
        
        // Save one last time on cleanup
        if (user?.id && playtimeRef.current > 0) {
          const today = new Date().toISOString().slice(0, 10);
          updateParentalControl(user.id, {
            playtimeToday: playtimeRef.current,
            lastPlayedDate: today,
          });
        }
      }
    };
  }, [user?.id, navigate]);
}
