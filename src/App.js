import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { SettingsProvider } from "./context/SettingsContext";
import Home from "./pages/Home";
import GameMenu from "./pages/GameMenu";
import WordMatch from "./pages/WordMatch";
import LetterBuild from "./pages/LetterBuild";
import Reward from "./pages/Reward";
import Settings from "./pages/Settings";
import AuthPage from './pages/Auth';

import "./index.css";

function App() {
  const [user, setUser] = useState(null);

  return (
    <SettingsProvider>
      <Router>
        <Routes>
          {/* Landing page */}
          <Route 
            path="/" 
            element={user ? <Navigate to="/menu" /> : <AuthPage onLogin={setUser} />} 
          />

          {/* Main app routes (require login/guest) */}
          <Route path="/menu" element={user ? <GameMenu user={user} /> : <Navigate to="/" />} />
          <Route path="/game" element={user ? <WordMatch user={user} /> : <Navigate to="/" />} />
          <Route path="/letterbuild" element={user ? <LetterBuild user={user} /> : <Navigate to="/" />} />
          <Route path="/reward" element={user ? <Reward user={user} /> : <Navigate to="/" />} />
<Route
  path="/settings"
  element={user ? <Settings user={user} setUser={setUser} /> : <Navigate to="/" />}
/>
        </Routes>
      </Router>
    </SettingsProvider>
  );
}

export default App;
