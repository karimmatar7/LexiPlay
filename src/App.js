import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { SettingsProvider } from "./context/SettingsContext";
import Home from "./pages/Home";
import GameMenu from "./pages/GameMenu";
import WordMatch from "./pages/WordMatch";
import LetterBuild from "./pages/LetterBuild";
import WordMaze from "./pages/WordMaze";
import FinalWordBuilder from "./pages/FinalWordBuilder";
import Reward from "./pages/Reward";
import Settings from "./pages/Settings";
import AuthPage from './pages/Auth';
import { supabase } from './supaBaseClient';
import "./index.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch fresh user from DB
  const fetchUser = useCallback(async () => {
    setLoading(true);
    const session = (await supabase.auth.getSession()).data.session;
    if (session?.user) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();
      if (!error && data) {
        setUser(data);
      }
    } else {
      // No session, check if there's a user stored locally (for guest mode)
      const savedUser = localStorage.getItem("lexiplay_user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        // If it's a guest or if we have a user ID, fetch fresh data from DB
        if (parsed.id === "guest") {
          setUser(parsed);
        } else {
          // For logged-in users, always fetch from DB
          const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", parsed.id)
            .single();
          if (!error && data) {
            setUser(data);
            localStorage.setItem("lexiplay_user", JSON.stringify(data));
          }
        }
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });
    return () => listener.subscription.unsubscribe();
  }, [fetchUser]);

  if (loading) return <div>Loading...</div>;

  return (
    <SettingsProvider user={user} setUser={setUser}>
      <Router>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/menu" /> : <AuthPage onLogin={setUser} />} />
          <Route path="/menu" element={user ? <GameMenu user={user} fetchUser={fetchUser} /> : <Navigate to="/" />} />
 <Route path="/game" element={
  user ? <WordMatch user={user} setUser={setUser} fetchUser={fetchUser} /> : <Navigate to="/" />
} />
<Route path="/letterbuild" element={
  user ? <LetterBuild user={user} setUser={setUser} /> : <Navigate to="/" />
} />

          <Route path="/wordmaze" element={user ? <WordMaze user={user} setUser={setUser} /> : <Navigate to="/" />} />
          <Route path="/finalwordbuilder" element={user ? <FinalWordBuilder user={user} setUser={setUser} /> : <Navigate to="/" />} />
          <Route path="/reward" element={user ? <Reward user={user} /> : <Navigate to="/" />} />
          <Route path="/settings" element={user ? <Settings user={user} setUser={setUser} /> : <Navigate to="/" />} />
        </Routes>
      </Router>
    </SettingsProvider>
  );
}

export default App;