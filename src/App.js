import "./i18n"; 
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
import ProtectedRoute from "./components/ProtectedRoute"; // <-- import it
import { supabase } from './supaBaseClient';
import "./index.css";
import ParentalControlPage from "./pages/ParentalControlPage";
import ParentRoute from "./components/ParentRoute";
import ParentalUnlockPage from "./pages/ParentalUnlockPage";
import ParentDashboard from "./pages/ParentDashboard";
import { useTranslation } from "react-i18next";

function App() {
    const { t, i18n } = useTranslation(); 
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [parentUnlocked, setParentUnlocked] = useState(false);

const fetchUser = useCallback(async () => {
  setLoading(true);
  const session = (await supabase.auth.getSession()).data.session;
  let latestUser = null;

    if (session?.user) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();
      if (!error && data) latestUser = data;
    } else {
      const savedUser = localStorage.getItem("lexiplay_user");
      if (savedUser) latestUser = JSON.parse(savedUser);
    }

    if (latestUser) {
      setUser(latestUser);

      // 🔹 Set i18n language from user settings
      if (latestUser.settings?.language) {
        i18n.changeLanguage(latestUser.settings.language);
      }
    }
    setLoading(false);
  }, [i18n]);


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
<Route
  path="/game"
  element={
    <ProtectedRoute user={user} requiredUnlock="any">
      <WordMatch user={user} setUser={setUser} fetchUser={fetchUser} />
    </ProtectedRoute>
  }
/>


    <Route
  path="/letterbuild"
  element={
    <ProtectedRoute user={user} requiredUnlock="letterBuild">
      <LetterBuild user={user} setUser={setUser} />
    </ProtectedRoute>
  }
/>

<Route
  path="/wordmaze"
  element={
    <ProtectedRoute user={user} requiredUnlock="maze">
      <WordMaze user={user} setUser={setUser} />
    </ProtectedRoute>
  }
/>

<Route
  path="/finalwordbuilder"
  element={
    <ProtectedRoute user={user} requiredUnlock="finalWord">
      <FinalWordBuilder user={user} setUser={setUser} />
    </ProtectedRoute>
  }
/>


          <Route path="/reward" element={user ? <Reward user={user} /> : <Navigate to="/" />} />
          <Route path="/settings" element={user ? <Settings user={user} setUser={setUser} /> : <Navigate to="/" />} />

<Route
  path="/parental-control"
  element={
    <ParentRoute unlocked={parentUnlocked}>
      <ParentalControlPage user={user} fetchUser={fetchUser} />
    </ParentRoute>
  }
/>
<Route
  path="/unlock-parental"
  element={<ParentalUnlockPage user={user} setUnlocked={setParentUnlocked} />}
/>

<Route
  path="/parent-dashboard/:childId"
  element={
    <ParentRoute unlocked={parentUnlocked}>
      <ParentDashboard />
    </ParentRoute>
  }
/>

        </Routes>
      </Router>
    </SettingsProvider>
  );
}

export default App;
