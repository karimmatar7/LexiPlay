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

    const startTracking = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("parental_control")
        .eq("id", user.id)
        .single();

      if (error) return;

      const pc = data?.parental_control || {};
      if (!pc.enabled) return;

      const today = new Date().toISOString().slice(0, 10);
      let playtimeToday = pc.playtimeToday || 0;
      const dailyLimitSeconds = (pc.dailyLimitMinutes || 60) * 60;

      // Reset day
      if (pc.lastPlayedDate !== today) {
        playtimeToday = 0;
        await updateParentalControl(user.id, {
          playtimeToday: 0,
          lastPlayedDate: today,
          lastActiveAt: null,
        });
      }

      // 🔥 Recover missing time
      if (pc.lastActiveAt) {
        const lastActive = new Date(pc.lastActiveAt);
        const diff = Math.floor((Date.now() - lastActive) / 1000);
        playtimeToday += Math.max(diff, 0);
      }

      playtimeRef.current = playtimeToday;

      if (playtimeToday >= dailyLimitSeconds && !hasNavigatedRef.current) {
        hasNavigatedRef.current = true;
        navigate("/menu", { replace: true });
        return;
      }

      timerRef.current = setInterval(async () => {
        playtimeRef.current += 1;

        // Save every second (safe now)
        await updateParentalControl(user.id, {
          playtimeToday: playtimeRef.current,
          lastPlayedDate: today,
          lastActiveAt: new Date().toISOString(),
        });

        if (
          playtimeRef.current >= dailyLimitSeconds &&
          !hasNavigatedRef.current
        ) {
          hasNavigatedRef.current = true;
          clearInterval(timerRef.current);
          navigate("/menu", { replace: true });
        }
      }, 1000);
    };

    startTracking();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        updateParentalControl(user.id, {
          playtimeToday: playtimeRef.current,
          lastPlayedDate: new Date().toISOString().slice(0, 10),
          lastActiveAt: new Date().toISOString(),
        });
      }
    };
  }, [user?.id, navigate]);
}
