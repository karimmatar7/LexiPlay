import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getUser } from "../utils/user";

export default function ProtectedRoute({ user, requiredUnlock, children }) {
  const [latestUser, setLatestUser] = useState(user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLatestUser() {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      const fresh = await getUser(user.id);
      setLatestUser(fresh || user);
      setLoading(false);
    }
    fetchLatestUser();
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (!latestUser) return <Navigate to="/menu" replace />;

  const progress = latestUser.progress || {};
  const letterBuildProgress = progress.letterBuild || {};

  // --- Unlocks based on progress ---
  const letterBuildUnlocked = !!progress.wordMatch?.letterBuildUnlocked;
  const mazeUnlocked = !!letterBuildProgress.mazeUnlocked;
  const finalUnlocked = !!progress.wordMaze?.finalWordBuilderUnlocked;

  // --- Check daily limit ---
  const pc = latestUser.parental_control || {};
  
  console.log("ProtectedRoute Debug:", {
    enabled: pc.enabled,
    lastPlayedDate: pc.lastPlayedDate,
    playtimeToday: pc.playtimeToday,
    dailyLimit: pc.dailyLimitMinutes,
    requiredUnlock
  });

  // Check if parental control is enabled
  if (pc.enabled) {
    const today = new Date().toISOString().slice(0, 10);
    const playtimeToday = pc.playtimeToday || 0;
    const dailyLimit = pc.dailyLimitMinutes || 60;
    const limitReached = pc.lastPlayedDate === today && playtimeToday >= dailyLimit * 60;

    console.log("Daily Limit Check:", {
      today,
      lastPlayedDate: pc.lastPlayedDate,
      playtimeToday,
      dailyLimitSeconds: dailyLimit * 60,
      limitReached
    });

    if (limitReached) {
      console.log("LIMIT REACHED - Redirecting to menu");
      return <Navigate to="/menu" replace />;
    }
  }

  // --- Redirect if not unlocked by progress ---
  switch (requiredUnlock) {
    case "letterBuild":
      if (!letterBuildUnlocked) return <Navigate to="/menu" replace />;
      break;
    case "maze":
      if (!mazeUnlocked) return <Navigate to="/menu" replace />;
      break;
    case "finalWord":
      if (!finalUnlocked) return <Navigate to="/menu" replace />;
      break;
    case "any":
      // No unlock requirement, but daily limit still applies (checked above)
      break;
    default:
      break;
  }

  return children;
}
