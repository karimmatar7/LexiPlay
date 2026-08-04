import "./i18n";
import React, { useCallback, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import { useTranslation } from "react-i18next";

import { SettingsProvider } from "./context/SettingsContext";
import { supabase } from "./supaBaseClient";

import LandingPage from "./pages/LandingPage";
import WhyLexiPlay from "./pages/WhyLexiPlay";
import GameMenu from "./pages/GameMenu";
import WordMatch from "./pages/WordMatch";
import LetterBuild from "./pages/LetterBuild";
import WordMaze from "./pages/WordMaze";
import FinalWordBuilder from "./pages/FinalWordBuilder";
import LetterDraw from "./pages/LetterDraw";
import Reward from "./pages/Reward";
import Settings from "./pages/Settings";
import Support from "./pages/Support";
import AuthPage from "./pages/Auth";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ResetParentalPinPage from "./pages/ResetParentalPinPage";
import ParentalControlPage from "./pages/ParentalControlPage";
import ParentalUnlockPage from "./pages/ParentalUnlockPage";
import ParentDashboard from "./pages/ParentDashboard";
import AvatarEditor from "./pages/AvatarEditor";

import ProtectedRoute from "./components/ProtectedRoute";
import ParentRoute from "./components/ParentRoute";

import "./index.css";

function App() {
  const { i18n } = useTranslation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [langLoaded, setLangLoaded] = useState(false);
  const [parentUnlocked, setParentUnlocked] = useState(false);

  const fetchUser = useCallback(async () => {
    setLoading(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.user) {
        setUser(null);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error || !data) {
        setUser(null);
        return;
      }

      setUser(data);

      const savedLanguage = data.settings?.language;

      if (savedLanguage) {
        await i18n.changeLanguage(savedLanguage);
      }
    } catch (error) {
      console.error("Failed to restore user session:", error);
      setUser(null);
    } finally {
      setLoading(false);
      setLangLoaded(true);
    }
  }, [i18n]);

  useEffect(() => {
    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      const isResetPage = window.location.pathname === "/reset-password";

      if (isResetPage || event === "PASSWORD_RECOVERY") {
        return;
      }

      fetchUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUser]);

  if (!langLoaded) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9fc]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100">
            <img
              src="/fox.png"
              alt=""
              aria-hidden="true"
              className="h-11 w-11 object-contain"
            />
          </div>

          <div
            className="h-6 w-6 animate-spin rounded-full border-2 border-purple-200 border-t-purple-700"
            aria-label="Loading"
          />
        </div>
      </div>
    );
  }

  return (
    <SettingsProvider user={user} setUser={setUser}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              user ? <Navigate to="/menu" replace /> : <LandingPage />
            }
          />

          <Route
            path="/auth"
            element={
              user ? (
                <Navigate to="/menu" replace />
              ) : (
                <AuthPage onLogin={setUser} />
              )
            }
          />

          <Route
            path="/why-lexiplay"
            element={
              user ? <Navigate to="/menu" replace /> : <WhyLexiPlay />
            }
          />

          <Route
            path="/auth/callback"
            element={<AuthCallbackPage onLogin={setUser} />}
          />

          <Route
            path="/reset-password"
            element={<ResetPasswordPage />}
          />

          <Route
            path="/reset-parental-pin"
            element={<ResetParentalPinPage />}
          />

          {/* Main menu */}
          <Route
            path="/menu"
            element={
              user ? (
                <GameMenu
                  user={user}
                  setUser={setUser}
                  fetchUser={fetchUser}
                />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          {/* Games */}
          <Route
            path="/game"
            element={
              <ProtectedRoute user={user} requiredUnlock="any">
                <WordMatch
                  user={user}
                  setUser={setUser}
                  fetchUser={fetchUser}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/letterbuild"
            element={
              <ProtectedRoute
                user={user}
                requiredUnlock="letterBuild"
              >
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
              <ProtectedRoute
                user={user}
                requiredUnlock="finalWord"
              >
                <FinalWordBuilder
                  user={user}
                  setUser={setUser}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/letterdraw"
            element={
              <ProtectedRoute
                user={user}
                requiredUnlock="letterDraw"
              >
                <LetterDraw user={user} setUser={setUser} />
              </ProtectedRoute>
            }
          />

          {/* Other protected pages */}
          <Route
            path="/reward"
            element={
              user ? (
                <Reward user={user} />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          <Route
            path="/settings"
            element={
              user ? (
                <Settings user={user} setUser={setUser} />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          <Route
            path="/support"
            element={
              user ? (
                <Support />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          <Route
            path="/avatar"
            element={
              user ? (
                <AvatarEditor
                  user={user}
                  setUser={setUser}
                />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          {/* Parental control */}
          <Route
            path="/unlock-parental"
            element={
              user ? (
                <ParentalUnlockPage
                  user={user}
                  setUnlocked={setParentUnlocked}
                />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          <Route
            path="/parental-control"
            element={
              user ? (
                <ParentRoute unlocked={parentUnlocked}>
                  <ParentalControlPage
                    user={user}
                    fetchUser={fetchUser}
                  />
                </ParentRoute>
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          <Route
            path="/parent-dashboard/:childId"
            element={
              user ? (
                <ParentRoute unlocked={parentUnlocked}>
                  <ParentDashboard />
                </ParentRoute>
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          {/* Unknown routes */}
          <Route
            path="*"
            element={
              <Navigate
                to={user ? "/menu" : "/"}
                replace
              />
            }
          />
        </Routes>
      </Router>
    </SettingsProvider>
  );
}

export default App;