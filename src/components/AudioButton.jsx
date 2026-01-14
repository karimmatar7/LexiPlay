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

  const normalizeWord = (text, lang) => {
    if (lang === "fr") {
      // Keep accents for French
      return text.toLowerCase().normalize("NFC").replace(/\s+/g, "_");
    }
    // For English and Dutch: remove accents and non-alphanumeric
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
  };

  const playWord = (word) => {
    if (!soundOn || paused || !word) return;

    const languagePrefix =
      i18n.language === "en"
        ? "en"
        : i18n.language === "fr"
        ? "fr"
        : "nl";

    const normalizedWord = normalizeWord(word, i18n.language); // <-- pass language
    const audioPath = `/sounds/${languagePrefix}/${normalizedWord}.mp3`;

    const audio = new Audio(audioPath);
    audio.play().catch(err =>
      console.error("Audio play error:", audioPath, err)
    );
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
