import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSettings } from "../context/SettingsContext";
import SettingCard from "../components/SettingCard";
import SettingButton from "../components/SettingButton";
import { supabase } from "../supaBaseClient.js";

export default function Settings({ user, setUser }) {
  const { t, i18n } = useTranslation();
  const { fontType, setFontType, fontSize, setFontSize, soundOn, setSoundOn } = useSettings();

  // Initialize language from user settings
  useEffect(() => {
    if (user?.settings?.language) {
      i18n.changeLanguage(user.settings.language);
    }
  }, [user, i18n]);

  // Change language function
const changeLanguage = async (lng) => {
  i18n.changeLanguage(lng);

  if (!user) return;

  // Update local state
  const updatedUser = {
    ...user,
    settings: { ...user.settings, language: lng },
  };
  setUser(updatedUser);
  localStorage.setItem("lexiplay_user", JSON.stringify(updatedUser));

  // Update Supabase DB
  try {
    const { data, error } = await supabase
      .from("users")
      .update({ settings: updatedUser.settings })
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;
    console.log("Language updated in DB:", data.settings.language);
  } catch (err) {
    console.error("Failed to update language in DB:", err);
  }
};

  return (
    <div className="min-h-screen bg-rose-50 p-6 md:p-8 relative">
      {/* Decorative shapes */}
      <div className="absolute top-12 right-12 w-32 h-32 bg-indigo-200 rounded-full opacity-30" />
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-amber-200 rounded-full opacity-25" />

      <div className="relative max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block mb-6 bg-white rounded-3xl p-8 shadow-sm border-4 border-rose-300">
            <span className="text-7xl">⚙️</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4 text-rose-700" style={{ letterSpacing: '-0.02em' }}>
            {t("settings.title")}
          </h1>
          <p className="text-xl text-gray-700 font-medium">
            {t("settings.subtitle")}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border-2 p-8 mb-10 space-y-8">
          {/* Font Type */}
          <SettingCard 
            icon="🔤" 
            title={t("settings.fontType.title")} 
            description={t("settings.fontType.description")}
          >
            <div className="grid grid-cols-2 gap-4 mt-4">
              <SettingButton 
                active={fontType === "normal"} 
                onClick={() => setFontType("normal")} 
                label={t("settings.fontType.normal")} 
              />
              <SettingButton 
                active={fontType === "dyslexic"} 
                onClick={() => setFontType("dyslexic")} 
                label={t("settings.fontType.dyslexic")} 
              />
            </div>
          </SettingCard>

          {/* Font Size */}
          <SettingCard 
            icon="🔠" 
            title={t("settings.fontSize.title")} 
            description={t("settings.fontSize.description")}
          >
            <div className="grid grid-cols-3 gap-3 mt-4">
              <SettingButton 
                active={fontSize === "small"} 
                onClick={() => setFontSize("small")} 
                label={t("settings.fontSize.small")} 
              />
              <SettingButton 
                active={fontSize === "medium"} 
                onClick={() => setFontSize("medium")} 
                label={t("settings.fontSize.medium")} 
              />
              <SettingButton 
                active={fontSize === "large"} 
                onClick={() => setFontSize("large")} 
                label={t("settings.fontSize.large")} 
              />
            </div>
          </SettingCard>

          {/* Sound Toggle */}
          <SettingCard 
            icon="🔊" 
            title={t("settings.sound.title")} 
            description={t("settings.sound.description")}
          >
            <div className="mt-4 flex items-center justify-between">
              <span className="text-lg font-semibold">{t("settings.sound.label")}</span>
              <label className="relative inline-block w-24 h-12 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={soundOn} 
                  onChange={() => setSoundOn(!soundOn)} 
                  className="sr-only" 
                />
                <div className={`w-24 h-12 rounded-full transition-colors duration-300 border-2 flex items-center ${
                  soundOn ? "bg-green-400 border-green-600" : "bg-gray-300 border-gray-400"
                }`}>
                  <div className={`absolute top-1 w-10 h-10 bg-white rounded-full shadow-md transition-all duration-300 ${
                    soundOn ? "right-1" : "left-1"
                  } flex items-center justify-center`}>
                    {soundOn ? "🔊" : "🔇"}
                  </div>
                </div>
              </label>
            </div>
          </SettingCard>

          {/* Language Selector */}
          <SettingCard
            icon="🌐"
            title={t("settings.language.title") || "Language"}
            description={t("settings.language.description") || "Choose your preferred language"}
          >
            <div className="grid grid-cols-2 gap-4 mt-4">
              <SettingButton 
                active={user?.settings?.language === "en"} 
                onClick={() => changeLanguage("en")} 
                label="English" 
              />
              <SettingButton 
                active={user?.settings?.language === "nl"} 
                onClick={() => changeLanguage("nl")} 
                label="Nederlands" 
              />
            </div>
          </SettingCard>

          <SettingCard
  icon="🆘"
  title={t("support.title")}
  description={t("support.description")}
>
  <Link
    to="/support"
    className="mt-4 inline-flex items-center justify-center w-full bg-indigo-500 hover:bg-indigo-600 text-white py-4 rounded-2xl font-bold transition"
  >
    {t("support.button")}
  </Link>
</SettingCard>


        </div>

        {/* Navigation buttons side by side */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Link
            to="/menu"
            className="flex-1 text-center group inline-flex items-center justify-center gap-3 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-5 rounded-2xl font-bold shadow-md hover:shadow-lg border-b-4 border-indigo-700 transform hover:scale-105 transition-all duration-200"
          >
            <span className="text-2xl">🎮</span>
            <span>{t("settings.buttons.toGames")}</span>
          </Link>

          <button
            onClick={() => {
              localStorage.removeItem("lexiplay_user");
              if (setUser) setUser(null);
              window.location.href = "/";
            }}
            className="flex-1 text-center bg-red-400 hover:bg-red-500 text-white px-4 py-5 rounded-2xl font-bold shadow-md hover:shadow-lg border-b-4 border-red-600 transform hover:scale-105 transition-all duration-200"
          >
            {t("settings.buttons.logout")}
          </button>
        </div>
      </div>
    </div>
  );
}
