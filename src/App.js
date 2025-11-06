import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { SettingsProvider } from "./context/SettingsContext"
import Home from "./pages/Home"
import GameMenu from "./pages/GameMenu"
import WordMatch from "./pages/WordMatch"
import Reward from "./pages/Reward"
import Settings from "./pages/Settings"
import "./index.css"

function App() {
  return (
    <SettingsProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<GameMenu />} />
          <Route path="/game" element={<WordMatch />} />
          <Route path="/reward" element={<Reward />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Router>
    </SettingsProvider>
  )
}

export default App
