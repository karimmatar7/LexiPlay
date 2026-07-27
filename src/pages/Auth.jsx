import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createUser, loginUser, resetPin } from "../utils/user.js";
import RecoveryCodeModal from "../components/RecoveryCodeModal";
import ResetPinModal from "../components/ResetPinModal";
import SuccessModal from "../components/SuccessModal";
import { useTranslation } from "react-i18next";
import { useSettings } from "../context/SettingsContext.jsx";

export default function AuthPage({ onLogin }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [showPin, setShowPin] = useState(false);

  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [plainRecoveryCode, setPlainRecoveryCode] = useState("");
  const [pendingUser, setPendingUser] = useState(null);
  const [copied, setCopied] = useState(false);

  const [showResetModal, setShowResetModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [resetName, setResetName] = useState("");
  const [recoveryInput, setRecoveryInput] = useState("");
  const [newPin, setNewPin] = useState("");
  const [resetError, setResetError] = useState("");

  const { language, setLanguage } = useSettings();

  // -----------------------------
  // Toggle language
  // -----------------------------
  const toggleLanguage = () => {
    const nextLang =
      language === "en" ? "nl" : language === "nl" ? "fr" : "en";

    setLanguage(nextLang); // saves to Supabase automatically
    i18n.changeLanguage(nextLang);
  };

  // -----------------------------
  // Login
  // -----------------------------
  const handleLogin = async () => {
    if (!name || !pin) return setError(t("auth.errors.fillFields"));
    const user = await loginUser(name, pin);
    if (!user) return setError(t("auth.errors.loginFailed"));

    if (user.settings?.language && user.settings.language !== language) {
      await i18n.changeLanguage(user.settings.language);
      setLanguage(user.settings.language);
    }

    localStorage.setItem("lexiplay_user", JSON.stringify(user));
    onLogin(user);
    navigate("/menu");
  };

  // -----------------------------
  // Register
  // -----------------------------
  const handleRegister = async () => {
    if (!name || !pin) return setError(t("auth.errors.fillFields"));

    const res = await createUser(name, pin);
    if (!res) return setError(t("auth.errors.registerFailed"));

    setPendingUser(res.user);
    setPlainRecoveryCode(res.recoveryCode);
    setShowRecoveryModal(true);
  };

  // -----------------------------
  // Copy recovery code
  // -----------------------------
  const copyRecoveryCode = () => {
    navigator.clipboard.writeText(plainRecoveryCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // -----------------------------
  // Close recovery modal
  // -----------------------------
  const closeRecoveryModal = async () => {
    setShowRecoveryModal(false);
    setCopied(false);

    if (pendingUser) {
      if (language !== pendingUser.settings?.language) {
        await i18n.changeLanguage(language);
      }

      const userWithLang = {
        ...pendingUser,
        settings: {
          ...pendingUser.settings,
          language: language,
        },
      };

      localStorage.setItem("lexiplay_user", JSON.stringify(userWithLang));
      onLogin(userWithLang);
      navigate("/menu");
    }
  };

  // -----------------------------
  // Reset PIN
  // -----------------------------
  const handleResetPin = async () => {
    if (!resetName || !recoveryInput || !newPin) {
      setResetError(t("auth.errors.fillFields"));
      return;
    }
    const res = await resetPin(resetName, recoveryInput, newPin);
    if (!res) {
      setResetError(t("auth.errors.loginFailed"));
      return;
    }

    setShowResetModal(false);
    setResetName("");
    setRecoveryInput("");
    setNewPin("");
    setResetError("");
    setShowSuccessModal(true);
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetError("");
    setResetName("");
    setRecoveryInput("");
    setNewPin("");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 p-4 relative overflow-hidden">
      {/* Language toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleLanguage}
          className="group inline-flex items-center gap-2 bg-white hover:bg-purple-50 border border-purple-200 hover:border-purple-300 px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-full font-bold shadow-[0_8px_20px_rgba(147,51,234,0.15)] hover:shadow-[0_10px_24px_rgba(147,51,234,0.25)] transition-all duration-200 min-w-[60px] sm:min-w-[70px]"
          aria-label={t("changeLanguage")}
        >
          <svg
            className="w-5 h-5 text-purple-600 group-hover:text-purple-700 transition-colors flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
            />
          </svg>

          <span className="text-sm sm:text-base font-bold text-purple-700 uppercase tracking-wide">
            {language === "en" ? "EN" : language === "nl" ? "NL" : "FR"}
          </span>

          <span className="hidden sm:inline text-xs text-purple-400 font-medium">
            → {language === "en" ? "NL" : language === "nl" ? "FR" : "EN"}
          </span>
        </button>
      </div>

      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-300 rounded-full opacity-40 pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-green-300 rounded-full opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-purple-300 rounded-full opacity-35 pointer-events-none" />

      {/* Main Auth Card */}
      <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-[0_25px_60px_rgba(147,51,234,0.15)] border border-purple-100 p-6 sm:p-8 md:p-10 w-full max-w-md space-y-7 sm:space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="inline-flex items-center justify-center p-5 sm:p-6 mb-1 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200 shadow-[0_10px_25px_rgba(147,51,234,0.15)]">
            <img
              src="/fox.png"
              alt="LexiPlay Logo"
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28"
            />
          </div>
          <h1
            className="text-3xl sm:text-4xl font-black text-purple-700"
            style={{ letterSpacing: "-0.02em" }}
          >
            {t("auth.welcome")}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 font-medium">
            {t("auth.subtitle")}
          </p>
        </div>

        {/* Input Fields */}
        <div className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
              {t("auth.nameLabel")}
            </label>
            <input
              type="text"
              placeholder={t("auth.namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3.5 text-base sm:text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
              {t("auth.pinLabel")}
            </label>
            <div className="relative">
              <input
                type={showPin ? "text" : "password"}
                placeholder={t("auth.pinPlaceholder")}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength="10"
                className="w-full px-4 py-3.5 text-base sm:text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-gray-50 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                aria-label={showPin ? "Hide PIN" : "Show PIN"}
              >
                {showPin ? (
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.228.223-2.403.637-3.5M9.879 9.879A3 3 0 1114.121 14.12m0 0L21 21m-7-7l-7-7" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleLogin}
            className="flex-1 inline-flex items-center justify-center gap-2.5 bg-indigo-500 hover:bg-indigo-600 text-white py-3.5 rounded-full font-bold shadow-[0_8px_20px_rgba(99,102,241,0.35)] hover:shadow-[0_10px_24px_rgba(99,102,241,0.45)] transition-all duration-200 text-sm sm:text-base"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 flex-shrink-0" aria-hidden="true">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
            <span>{t("auth.login")}</span>
          </button>
          <button
            onClick={handleRegister}
            className="flex-1 inline-flex items-center justify-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-full font-bold shadow-[0_8px_20px_rgba(16,185,129,0.35)] hover:shadow-[0_10px_24px_rgba(16,185,129,0.45)] transition-all duration-200 text-sm sm:text-base"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 flex-shrink-0" aria-hidden="true">
              <path d="M12 2l2.09 6.26L20 9l-5 4.14L16.18 20 12 16.6 7.82 20 9 13.14 4 9l5.91-.74L12 2z" />
            </svg>
            <span>{t("auth.register")}</span>
          </button>
        </div>

        {/* Pin vergeten */}
        <button
          onClick={() => setShowResetModal(true)}
          className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-800 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 flex-shrink-0" aria-hidden="true">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
          <span>{t("auth.forgotPin")}</span>
        </button>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p className="text-red-700 font-semibold text-sm leading-relaxed">{error}</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <RecoveryCodeModal
        show={showRecoveryModal}
        recoveryCode={plainRecoveryCode}
        copied={copied}
        onCopy={copyRecoveryCode}
        onClose={closeRecoveryModal}
      />

      <ResetPinModal
        show={showResetModal}
        name={resetName}
        recoveryCode={recoveryInput}
        newPin={newPin}
        error={resetError}
        onNameChange={setResetName}
        onRecoveryCodeChange={setRecoveryInput}
        onNewPinChange={setNewPin}
        onReset={handleResetPin}
        onClose={closeResetModal}
      />

      <SuccessModal show={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
    </div>
  );
}