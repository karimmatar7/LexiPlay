import React from "react";
import { useTranslation } from "react-i18next";
import soundIcon from "../assets/icons/sound.png";

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
    className={`inline-flex w-full items-center justify-center gap-2 bg-indigo-500 text-center font-bold text-white rounded-2xl border-b-4 border-indigo-700 shadow-md transition-all duration-200 hover:scale-105 hover:bg-indigo-600 hover:shadow-lg sm:gap-3 ${className}`}
  >
    <img
      src={soundIcon}
      alt=""
      aria-hidden="true"
      draggable="false"
      className="h-6 w-6 shrink-0 object-contain sm:h-7 sm:w-7 md:h-8 md:w-8"
    />

    <span>{t(labelKey)}</span>
  </button>
);
}
