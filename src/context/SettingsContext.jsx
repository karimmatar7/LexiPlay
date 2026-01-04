import React, { createContext, useState, useContext, useEffect } from "react";
import { updateSettings, getUser } from "../utils/user.js";

const SettingsContext = createContext();

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children, user, setUser }) {
  const [fontType, setFontType] = useState("normal");
  const [fontSize, setFontSize] = useState("medium");
  const [soundOn, setSoundOn] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState("normal");
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");

  // Load latest settings from DB whenever user changes
  useEffect(() => {
    if (!user?.id) return;

    async function loadSettings() {
      const latestUser = await getUser(user.id);
      const s = latestUser?.settings || {};

      setFontType(s.fontType || "normal");
      setFontSize(s.fontSize || "medium");
      setSoundOn(s.soundOn ?? true);
      setAnimationSpeed(s.animationSpeed || "normal");
      setTheme(s.theme || "light");
      setLanguage(s.language || "en");

      if (setUser) setUser(latestUser);
    }

    loadSettings();
  }, [user?.id]);

  // Apply font and theme styles dynamically
  useEffect(() => {
    const root = document.documentElement;

    // CSS variables
    root.style.setProperty(
      "--font-size",
      fontSize === "small" ? "0.9rem" : fontSize === "large" ? "1.3rem" : "1rem"
    );

    root.style.setProperty(
      "--font-family",
      fontType === "dyslexic" ? "'OpenDyslexic', sans-serif" : "sans-serif"
    );

    root.style.setProperty(
      "--animation-duration",
      animationSpeed === "slow" ? "14s" : animationSpeed === "fast" ? "3s" : "7s"
    );

    root.setAttribute("data-theme", theme);

    // Add/remove classes for immediate font change (works on phones)
    root.classList.toggle("font-dyslexic", fontType === "dyslexic");
    root.classList.toggle("font-sans", fontType === "normal");
  }, [fontType, fontSize, animationSpeed, theme]);

  // Save settings to DB and update user
  const saveSettingsToDB = async (newSettings) => {
    if (!user?.id) return;
    const updatedUser = await updateSettings(user.id, newSettings);
    if (updatedUser && setUser) {
      setUser(prev => ({ ...prev, settings: updatedUser.settings || newSettings }));
    }
  };

  const updateFontType = (type) => {
    setFontType(type);
    saveSettingsToDB({ fontType: type });
  };

  const updateFontSize = (size) => {
    setFontSize(size);
    saveSettingsToDB({ fontSize: size });
  };

  const updateSound = (on) => {
    setSoundOn(on);
    saveSettingsToDB({ soundOn: on });
  };

  const updateAnimationSpeed = (speed) => {
    setAnimationSpeed(speed);
    saveSettingsToDB({ animationSpeed: speed });
  };

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    saveSettingsToDB({ theme: newTheme });
  };

  const updateLanguage = async (newLang) => {
    setLanguage(newLang);
    if (!user?.id) return;
    await updateSettings(user.id, { language: newLang });
  };

  return (
    <SettingsContext.Provider
      value={{
        fontType,
        setFontType: updateFontType,
        fontSize,
        setFontSize: updateFontSize,
        soundOn,
        setSoundOn: updateSound,
        animationSpeed,
        setAnimationSpeed: updateAnimationSpeed,
        theme,
        setTheme: updateTheme,
        language,
        setLanguage: updateLanguage,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
