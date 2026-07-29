import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supaBaseClient";
import { updateParentalControl, addPlaytime } from "../supabaseFunctions";

export default function usePlaytimeTracker(user) {
  const navigate = useNavigate();

  const timerRef = useRef(null);
  const playtimeRef = useRef(0);
  const lastSavedRef = useRef(0);
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;

    const startTracking = async () => {
      const today = new Date().toISOString().slice(0, 10);

      // Always fetch the latest settings from Supabase.
      const { data: latestUser, error } = await supabase
        .from("users")
        .select("parental_control")
        .eq("id", user.id)
        .single();

      if (error || !latestUser || cancelled) {
        console.error("Could not load parental controls:", error);
        return;
      }

      const pc = latestUser.parental_control ?? {};
      let playtimeToday = pc.playtimeToday ?? 0;
      const dailyLimitSeconds = (pc.dailyLimitMinutes ?? 60) * 60;
      const parentalControlEnabled = pc.enabled === true;

      console.log("Starting playtime tracker:", {
        playtimeToday,
        dailyLimitSeconds,
        parentalControlEnabled,
        pc,
      });

      // Reset the counter at the start of a new day.
      if (pc.lastPlayedDate !== today) {
        playtimeToday = 0;

        if (parentalControlEnabled) {
          await updateParentalControl(user.id, {
            playtimeToday: 0,
            lastPlayedDate: today,
            lastActiveAt: null,
            limitReachedAt: null,
          });
        }
      }

      // Recover time not saved before a refresh/close.
      if (pc.lastActiveAt) {
        const lastActive = new Date(pc.lastActiveAt);
        const elapsedSeconds = Math.floor(
          (Date.now() - lastActive.getTime()) / 1000
        );

        playtimeToday += Math.max(elapsedSeconds, 0);
      }

      playtimeRef.current = playtimeToday;
      lastSavedRef.current = playtimeToday;

      // This blocks immediately when dailyLimitMinutes is 0.
      if (
        parentalControlEnabled &&
        playtimeToday >= dailyLimitSeconds &&
        !hasNavigatedRef.current
      ) {
        hasNavigatedRef.current = true;

        await updateParentalControl(user.id, {
          playtimeToday: dailyLimitSeconds,
          lastPlayedDate: today,
          lastActiveAt: new Date().toISOString(),
          limitReachedAt: pc.limitReachedAt ?? new Date().toISOString(),
        });

        navigate("/menu", { replace: true });
        return;
      }

      timerRef.current = setInterval(async () => {
        playtimeRef.current += 1;

        // Save playtime in batches every 30 seconds.
        if (playtimeRef.current % 30 === 0) {
          const secondsToAdd =
            playtimeRef.current - lastSavedRef.current;

          lastSavedRef.current = playtimeRef.current;

          if (parentalControlEnabled) {
            await updateParentalControl(user.id, {
              playtimeToday: playtimeRef.current,
              lastPlayedDate: today,
              lastActiveAt: new Date().toISOString(),
            });
          }

          await addPlaytime(user.id, secondsToAdd / 60);
        }

        if (
          parentalControlEnabled &&
          playtimeRef.current >= dailyLimitSeconds &&
          !hasNavigatedRef.current
        ) {
          hasNavigatedRef.current = true;
          clearInterval(timerRef.current);

          const reachedAt = new Date().toISOString();

          await updateParentalControl(user.id, {
            playtimeToday: dailyLimitSeconds,
            lastPlayedDate: today,
            lastActiveAt: reachedAt,
            limitReachedAt: reachedAt,
          });

          navigate("/menu", { replace: true });
        }
      }, 1000);
    };

    startTracking();

    return () => {
      cancelled = true;

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      const secondsToAdd = playtimeRef.current - lastSavedRef.current;

      if (secondsToAdd > 0) {
        const today = new Date().toISOString().slice(0, 10);

        // Use the current prop here for cleanup; this is only best-effort.
        if (user.parental_control?.enabled === true) {
          updateParentalControl(user.id, {
            playtimeToday: playtimeRef.current,
            lastActiveAt: new Date().toISOString(),
            lastPlayedDate: today,
          });
        }

        addPlaytime(user.id, secondsToAdd / 60);
      }
    };
  }, [user?.id, navigate]);

  return null;
}