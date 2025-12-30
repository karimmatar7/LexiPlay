// src/components/ParentRoute.js
import { Navigate } from "react-router-dom";

export default function ParentRoute({ unlocked, children }) {
  if (!unlocked) return <Navigate to="/unlock-parental" />; // redirect if not unlocked
  return children;
}
