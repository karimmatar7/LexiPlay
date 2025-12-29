import React from "react"
import { Navigate } from "react-router-dom"

export default function ProtectedRoute({ user, requiredUnlock, children }) {
  if (!user) return <Navigate to="/menu" replace />;

  const progress = user.progress || {};
  const letterBuildProgress = progress.letterBuild || {};

  // safe boolean check
  const mazeUnlocked = !!letterBuildProgress.mazeUnlocked;
  const finalWordCompleted = !!letterBuildProgress.completed;

  switch (requiredUnlock) {
    case "maze":
      if (!mazeUnlocked) return <Navigate to="/menu" replace />;
      break;
    case "finalWord":
      if (!finalWordCompleted) return <Navigate to="/menu" replace />;
      break;
  }

  return children;
}

