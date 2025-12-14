import React, { createContext, useState, useContext, useEffect } from "react";
import { updateSettings } from "../supabaseFunctions.js";

const SettingsContext = createContext();

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children, user, setUser }) {
  const [fontType, setFontType] = useState("normal");
  const [fontSize, setFontSize] = useState("medium");
  const [soundOn, setSoundOn] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState("normal"); // new
  const [theme, setTheme] = useState("light"); // new

  // Load settings from user object when available
  useEffect(() => {
    if (!user) return;
    const s = user.settings || {};
    setFontType(s.fontType || "normal");
    setFontSize(s.fontSize || "medium");
    setSoundOn(s.soundOn ?? true);
    setAnimationSpeed(s.animationSpeed || "normal");
    setTheme(s.theme || "light");
  }, [user]);

  // Apply CSS variables
  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty(
      "--font-size",
      fontSize === "small" ? "0.9rem" :
      fontSize === "large" ? "1.3rem" :
      "1rem"
    );

    root.style.setProperty(
      "--font-family",
      fontType === "dyslexic" ? "'OpenDyslexic', sans-serif" : "sans-serif"
    );

    // Animation speed
    root.style.setProperty(
      "--animation-duration",
      animationSpeed === "slow" ? "14s" :
      animationSpeed === "fast" ? "3s" :
      "7s"
    );

    // Theme
    root.setAttribute("data-theme", theme);
  }, [fontSize, fontType, animationSpeed, theme]);

  // Save settings to DB
  const saveSettingsToDB = async (newSettings) => {
    if (!user) return;
    const updatedSettings = await updateSettings(user.id, newSettings);
    if (updatedSettings && setUser) {
      setUser(prev => ({ ...prev, settings: updatedSettings.settings }));
    }
  };

  const updateFontType = (type) => { setFontType(type); saveSettingsToDB({ fontType: type }); };
  const updateFontSize = (size) => { setFontSize(size); saveSettingsToDB({ fontSize: size }); };
  const updateSound = (on) => { setSoundOn(on); saveSettingsToDB({ soundOn: on }); };
  const updateAnimationSpeed = (speed) => { setAnimationSpeed(speed); saveSettingsToDB({ animationSpeed: speed }); };
  const updateTheme = (newTheme) => { setTheme(newTheme); saveSettingsToDB({ theme: newTheme }); };

  return (
    <SettingsContext.Provider value={{
      fontType, setFontType: updateFontType,
      fontSize, setFontSize: updateFontSize,
      soundOn, setSoundOn: updateSound,
      animationSpeed, setAnimationSpeed: updateAnimationSpeed,
      theme, setTheme: updateTheme,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}
