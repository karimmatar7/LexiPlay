import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getUser } from "../utils/user";

export default function ProtectedRoute({ user, requiredUnlock, children }) {
  if (!user) return <Navigate to="/menu" replace />;

  const pc = user.parental_control || {};

  // Only enforce limit if parental control is currently enabled
  if (pc.enabled) {
    const today = new Date().toISOString().slice(0, 10);
    const playtimeToday = pc.playtimeToday || 0;
    const dailyLimit = pc.dailyLimitMinutes || 60;
    const limitReached = pc.lastPlayedDate === today && playtimeToday >= dailyLimit * 60;

    if (limitReached) return <Navigate to="/menu" replace />;
  }

  // Unlocks based on progress
  const progress = user.progress || {};
  const letterBuildProgress = progress.letterBuild || {};
  const letterBuildUnlocked = !!progress.wordMatch?.letterBuildUnlocked;
  const mazeUnlocked = !!letterBuildProgress.mazeUnlocked;
  const finalUnlocked = !!progress.wordMaze?.finalWordBuilderUnlocked;

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
      break;
    default:
      break;
  }

  return children;
}
