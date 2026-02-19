import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getUser } from "../utils/user";

const MAX_HEARTS = 5;

export default function ProtectedRoute({ user, requiredUnlock, children }) {
  const [checked, setChecked] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    async function check() {
      if (!user?.id) {
        setRedirect("/");
        setChecked(true);
        return;
      }

      // Always fetch fresh from DB — stale prop won't reflect mid-game heart loss
      const fresh = await getUser(user.id);
      if (!fresh) {
        setRedirect("/");
        setChecked(true);
        return;
      }

      const pc = fresh.parental_control || {};
      const progress = fresh.progress || {};

      // --- Parental time limit ---
      if (pc.enabled) {
        const today = new Date().toISOString().slice(0, 10);
        const playtimeToday = pc.playtimeToday || 0;
        const dailyLimit = pc.dailyLimitMinutes || 60;
        const limitReached =
          pc.lastPlayedDate === today && playtimeToday >= dailyLimit * 60;
        if (limitReached) {
          setRedirect("/menu");
          setChecked(true);
          return;
        }
      }

      // --- Global lock: FinalWordBuilder 0 hearts = all games locked ---
      const finalHearts = progress.finalWordBuilder?.hearts ?? MAX_HEARTS;
      const finalCooldown = progress.finalWordBuilder?.cooldownUntil;
      const finalGloballyLocked =
        finalHearts <= 0 &&
        finalCooldown &&
        new Date(finalCooldown) > new Date();

      if (finalGloballyLocked) {
        setRedirect("/menu");
        setChecked(true);
        return;
      }

      // --- Key-purchase unlocks ---
      const letterBuildUnlocked = progress.letterBuild?.unlocked === true;
      const mazeUnlocked        = progress.wordMaze?.unlocked === true;
      const finalUnlocked       = progress.finalWordBuilder?.unlocked === true;

      switch (requiredUnlock) {
        case "letterBuild":
          if (!letterBuildUnlocked) { setRedirect("/menu"); setChecked(true); return; }
          break;
        case "maze":
          if (!mazeUnlocked) { setRedirect("/menu"); setChecked(true); return; }
          break;
        case "finalWord":
          if (!finalUnlocked) { setRedirect("/menu"); setChecked(true); return; }
          break;
        case "any":
        default:
          break;
      }

      setBlocked(false);
      setChecked(true);
    }

    check();
  }, [user?.id, requiredUnlock]);

  if (!checked) return null; // brief flash prevention
  if (redirect) return <Navigate to={redirect} replace />;
  return children;
}
