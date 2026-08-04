import { useTranslation } from "react-i18next";
import { useSettings } from "../context/SettingsContext";

const SUPPORTED_LANGUAGES = ["en", "nl", "fr"];

export default function useAppLanguage() {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useSettings();

  const detectedLanguage = (
    language ||
    i18n.resolvedLanguage ||
    i18n.language ||
    "en"
  )
    .split("-")[0]
    .toLowerCase();

  const currentLanguage = SUPPORTED_LANGUAGES.includes(detectedLanguage)
    ? detectedLanguage
    : "en";

  const languageCode = currentLanguage.toUpperCase();

  const setAppLanguage = async (nextLanguage) => {
    const safeLanguage = SUPPORTED_LANGUAGES.includes(nextLanguage)
      ? nextLanguage
      : "en";

    setLanguage(safeLanguage);
    await i18n.changeLanguage(safeLanguage);
  };

  const cycleLanguage = async () => {
    const currentIndex = SUPPORTED_LANGUAGES.indexOf(currentLanguage);
    const nextIndex = (currentIndex + 1) % SUPPORTED_LANGUAGES.length;

    await setAppLanguage(SUPPORTED_LANGUAGES[nextIndex]);
  };

  return {
    currentLanguage,
    languageCode,
    setAppLanguage,
    cycleLanguage,
  };
}