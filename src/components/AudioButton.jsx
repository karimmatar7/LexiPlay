import React from "react";
import { useTranslation } from "react-i18next";

export default function AudioButton({ 
  word, 
  soundOn, 
  paused, 
  labelKey = "audioButton.playWord", 
  className = "" 
}) {
  const { t, i18n } = useTranslation();

  const playWord = (word) => {
    if (!soundOn || paused || !word) return;
    
    // Get current language and set prefix
    const languagePrefix = i18n.language === "en" ? "en" : "nl";
    const audio = new Audio(`/sounds/${languagePrefix}/${word}.mp3`);
    audio.play().catch(err => console.error("Audio play error:", err));
  };

  return (
    <button
      onClick={() => playWord(word)}
      className={`bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl shadow-md border-b-4 border-indigo-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 ${className}`}
    >
      <span className="text-3xl md:text-4xl mr-2 md:mr-3">🔊</span>
      {t(labelKey)}
    </button>
  );
}
