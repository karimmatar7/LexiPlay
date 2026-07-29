import { useState, useEffect, useRef } from "react";
import { supabase } from "../supaBaseClient";
import { updateParentalControl } from "../supabaseFunctions";
import { useTranslation } from "react-i18next";

export function useParentalControl(user) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [limitReached, setLimitReached] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [returnTime, setReturnTime] = useState("");

  const timerRef = useRef(null);
  const modalShownRef = useRef(false);

const { t } = useTranslation();

const calculateReturnKey = (lastPlayedDate) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // If no lastPlayedDate, they can play today
  if (!lastPlayedDate) return "returnAtToday";

  const played = new Date(lastPlayedDate + "T00:00:00");
  const nextDay = new Date(played);
  nextDay.setDate(played.getDate() + 1);

  return today >= nextDay ? "returnAtToday" : "returnAtTomorrow";
};




  useEffect(() => {
    if (!user?.id) return;

    let alive = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("parental_control")
        .eq("id", user.id)
        .single();

      if (error || !alive) return;

const pc = data.parental_control ?? {};
if (pc.enabled !== true) return;

      const today = new Date().toISOString().slice(0, 10);
const limitSeconds = (pc.dailyLimitMinutes ?? 60) * 60;

let playtime = pc.playtimeToday ?? 0;

      // new day
      if (pc.lastPlayedDate !== today) {
        await updateParentalControl(user.id, {
          playtimeToday: 0,
          lastPlayedDate: today,
          lastActiveAt: null,
          limitReachedAt: null,
        });
        playtime = 0;
      }

      // recover lost seconds
      if (pc.lastActiveAt) {
        const diff = Math.floor(
          (Date.now() - new Date(pc.lastActiveAt)) / 1000
        );
        playtime += Math.max(diff, 0);
      }

      const remaining = Math.max(limitSeconds - playtime, 0);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        setLimitReached(true);

        const reachedAt = pc.limitReachedAt || new Date().toISOString();
        if (!pc.limitReachedAt) {
          await updateParentalControl(user.id, {
            limitReachedAt: reachedAt,
            playtimeToday: limitSeconds,
          });
        }

setReturnTime(calculateReturnKey(pc.lastPlayedDate));


        if (!modalShownRef.current) {
          modalShownRef.current = true;
          setShowLimitModal(true);
        }
        return;
      }

      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            const ts = new Date().toISOString();

            updateParentalControl(user.id, {
              limitReachedAt: ts,
              playtimeToday: limitSeconds,
              lastActiveAt: ts,
            });

            setLimitReached(true);
            setReturnTime(calculateReturnKey(ts));
            setShowLimitModal(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    };

    load();

    return () => {
      alive = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [user?.id]);

  return {
    timeLeft,
    limitReached,
    showLimitModal,
    returnTime,
    handleCloseModal: () => setShowLimitModal(false),
    setShowLimitModal,
    setLimitReached,
    modalShownRef,
  };
}
