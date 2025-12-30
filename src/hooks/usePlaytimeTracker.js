import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { updateParentalControl, addPlaytime } from "../supabaseFunctions";

export default function usePlaytimeTracker(user) {
  const navigate = useNavigate();

  const timerRef = useRef(null);
  const playtimeRef = useRef(0);
  const lastSavedRef = useRef(0);
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    if (!user?.id) return;

    const startTracking = async () => {
      const today = new Date().toISOString().slice(0, 10);
      const pc = user.parental_control || {};
      let playtimeToday = pc.playtimeToday || 0;
      const dailyLimitSeconds = (pc.dailyLimitMinutes || 60) * 60;

      console.log("Starting playtime tracker:", { playtimeToday, pc });

      // Reset day if new day
      if (pc.lastPlayedDate !== today) {
        playtimeToday = 0;
        if (pc.enabled) {
          await updateParentalControl(user.id, {
            playtimeToday: 0,
            lastPlayedDate: today,
            lastActiveAt: null,
          });
        }
      }

      // Recover missing time since lastActiveAt
      if (pc.lastActiveAt) {
        const lastActive = new Date(pc.lastActiveAt);
        const diff = Math.floor((Date.now() - lastActive) / 1000);
        playtimeToday += Math.max(diff, 0);
      }

      playtimeRef.current = playtimeToday;
      lastSavedRef.current = playtimeToday;

      // Check daily limit immediately if enabled
      if (pc.enabled && playtimeToday >= dailyLimitSeconds && !hasNavigatedRef.current) {
        hasNavigatedRef.current = true;
        console.log("Initial limit reached, redirecting to menu");
        navigate("/menu", { replace: true });
        return;
      }

      // Start 1-second interval
      timerRef.current = setInterval(async () => {
        playtimeRef.current += 1;

        // Batch update every 30s
        if (playtimeRef.current % 30 === 0) {
          const secondsToAdd = playtimeRef.current - lastSavedRef.current;
          lastSavedRef.current = playtimeRef.current;

          const pcNow = user.parental_control || {};
          console.log("Updating playtime batch:", { secondsToAdd, pcNow, playtimeRef: playtimeRef.current });

          // Update parental control if enabled
          if (pcNow.enabled) {
            await updateParentalControl(user.id, {
              playtimeToday: playtimeRef.current,
              lastPlayedDate: today,
              lastActiveAt: new Date().toISOString(),
            });
          }

          // Always update totalPlaytime regardless of parental control
          const minutesPlayed = secondsToAdd / 60;
          await addPlaytime(user.id, minutesPlayed);
          console.log("Total playtime added:", minutesPlayed, "minutes");
        }

        // Check daily limit only if enabled
        if (user.parental_control?.enabled && playtimeRef.current >= dailyLimitSeconds && !hasNavigatedRef.current) {
          hasNavigatedRef.current = true;
          console.log("Daily limit reached, redirecting to menu");
          clearInterval(timerRef.current);
          navigate("/menu", { replace: true });
        }
      }, 1000);
    };

    startTracking();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);

      const today = new Date().toISOString().slice(0, 10);
      const secondsToAdd = playtimeRef.current - lastSavedRef.current;

      console.log("Cleaning up tracker, final seconds to add:", secondsToAdd);

      if (secondsToAdd > 0) {
        if (user?.parental_control?.enabled) {
          updateParentalControl(user.id, {
            playtimeToday: playtimeRef.current,
            lastActiveAt: new Date().toISOString(),
            lastPlayedDate: today,
          });
        }

        addPlaytime(user.id, secondsToAdd / 60).then(res =>
          console.log("Final playtime save:", res)
        );
      }
    };
  }, [user?.id, navigate]);
}
