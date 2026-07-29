import React, { useEffect } from "react";
import AppButton from "../components/AppButton";
import { useTranslation } from "react-i18next";
import { useSettings } from "../context/SettingsContext";
import SettingCard from "../components/SettingCard";
import SettingButton from "../components/SettingButton";
import { supabase } from "../supaBaseClient.js";
import settingsIcon from "../assets/icons/settings.png";
import soundIcon from "../assets/icons/sound.png";
import languagesIcon from "../assets/icons/languages.png";
import fontSizeIcon from "../assets/icons/font-size.png";
import fontIcon from "../assets/icons/abc.png";
import helpIcon from "../assets/icons/sos.png";
import gamesIcon from "../assets/icons/games.png";

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
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-rose-50 to-orange-50 p-4 pb-10 md:p-8 relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute top-12 right-12 w-32 h-32 bg-indigo-200 rounded-full opacity-30 pointer-events-none" />
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-amber-200 rounded-full opacity-25 pointer-events-none" />

      <div className="relative max-w-3xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
          <div className="inline-flex items-center justify-center mb-5 md:mb-6 bg-white rounded-3xl p-6 md:p-8 shadow-[0_14px_30px_rgba(244,63,94,0.15)] border-4 border-rose-200">
            <img
              src={settingsIcon}
              alt=""
              aria-hidden="true"
              className="h-10 w-10 md:h-12 md:w-12 object-contain"
              draggable="false"
            />
          </div>
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-black mb-3 md:mb-4 text-rose-700"
            style={{ letterSpacing: "-0.02em" }}
          >
            {t("settings.title")}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 font-medium">
            {t("settings.subtitle")}
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-[0_20px_45px_rgba(15,23,42,0.06)] border border-rose-100 p-5 sm:p-6 md:p-8 mb-8 md:mb-10 space-y-6 md:space-y-8">
          {/* Font Type */}
          <SettingCard
            icon={
              <img
                src={fontIcon}
                alt=""
                aria-hidden="true"
                className="h-6 w-6 object-contain"
                draggable="false"
              />
            }
            title={t("settings.fontType.title")}
            description={t("settings.fontType.description")}
          >
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4">
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
            icon={
              <img
                src={fontSizeIcon}
                alt=""
                aria-hidden="true"
                className="h-6 w-6 object-contain"
                draggable="false"
              />
            }
            title={t("settings.fontSize.title")}
            description={t("settings.fontSize.description")}
          >
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mt-4">
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
            icon={
              <img
                src={soundIcon}
                alt=""
                aria-hidden="true"
                className="h-6 w-6 object-contain"
                draggable="false"
              />
            }
            title={t("settings.sound.title")}
            description={t("settings.sound.description")}
          >
            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="text-base sm:text-lg font-semibold text-gray-800">
                {t("settings.sound.label")}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={soundOn}
                onClick={() => setSoundOn(!soundOn)}
                className={`relative inline-flex items-center w-20 h-10 sm:w-24 sm:h-12 rounded-full transition-colors duration-300 border-2 flex-shrink-0 ${
                  soundOn
                    ? "bg-emerald-400 border-emerald-600"
                    : "bg-gray-300 border-gray-400"
                }`}
              >
                <span
                  className={`absolute top-1 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${
                    soundOn ? "right-1" : "left-1"
                  }`}
                >
                  {soundOn ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500"
                      aria-hidden="true"
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
                      aria-hidden="true"
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <line x1="23" y1="9" x2="17" y2="15" />
                      <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                  )}
                </span>
              </button>
            </div>
          </SettingCard>

          {/* Language Selector */}
          <SettingCard
            icon={
              <img
                src={languagesIcon}
                alt=""
                aria-hidden="true"
                className="h-6 w-6 object-contain"
                draggable="false"
              />
            }
            title={t("settings.language.title") || "Language"}
            description={t("settings.language.description") || "Choose your preferred language"}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-4">
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
              <SettingButton
                active={user?.settings?.language === "fr"}
                onClick={() => changeLanguage("fr")}
                label="Français"
              />
            </div>
          </SettingCard>

          {/* Support */}
          <SettingCard
            icon={
              <img
                src={helpIcon}
                alt=""
                aria-hidden="true"
                className="h-6 w-6 object-contain"
                draggable="false"
              />
            }
            title={t("support.title")}
            description={t("support.description")}
          >
          <AppButton
  to="/support"
  variant="indigo"
  className="mt-4 w-full sm:w-auto sm:px-8"
>
  {t("support.button")}
</AppButton>
          </SettingCard>
        </div>

        {/* Navigation buttons — pill style, matching GameMenu */}
       <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
  <AppButton
    to="/menu"
    variant="indigo"
    className="w-full text-sm sm:w-auto sm:text-base"
  >
    <img
      src={gamesIcon}
      alt=""
      aria-hidden="true"
      className="h-5 w-5 shrink-0 object-contain"
      draggable="false"
    />

    <span>{t("settings.buttons.toGames")}</span>
  </AppButton>

  <AppButton
    type="button"
    variant="neutral"
    onClick={async () => {
      try {
        const { error } = await supabase.auth.signOut({ scope: "local" });

        if (error) throw error;

        localStorage.removeItem("lexiplay_user");
        setUser(null);
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }}
    className="w-full border-red-200 text-sm text-red-500 hover:border-red-300 hover:bg-red-50 sm:w-auto sm:text-base"
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px] shrink-0"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>

    <span>{t("settings.buttons.logout")}</span>
  </AppButton>
</div>
      </div>
    </div>
  );
}