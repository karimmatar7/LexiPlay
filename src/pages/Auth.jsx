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
  // Persist language preference from user (if logged in)
  // -----------------------------
  useEffect(() => {
    const storedUser = localStorage.getItem("lexiplay_user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.language) {
          i18n.changeLanguage(user.language);
          setLanguage(user.language);
        }
      } catch {}
    }
  }, []);


  // -----------------------------
  // Toggle language
  // -----------------------------
const toggleLanguage = () => {
  const newLang = language === "en" ? "nl" : "en";
  setLanguage(newLang); // saves to Supabase automatically
  i18n.changeLanguage(newLang);
};

  // -----------------------------
  // Login
  // -----------------------------
  const handleLogin = async () => {
    if (!name || !pin) return setError(t("auth.errors.fillFields"));
    const user = await loginUser(name, pin);
    if (!user) return setError(t("auth.errors.loginFailed"));

    // Save user language preference
    user.language = language;
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
  const closeRecoveryModal = () => {
    setShowRecoveryModal(false);
    setCopied(false);

    if (pendingUser) {
      pendingUser.language = language;
      localStorage.setItem("lexiplay_user", JSON.stringify(pendingUser));
      onLogin(pendingUser);
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

      {/* Responsive language toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleLanguage}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-xl font-bold shadow-md text-sm sm:text-base"
        >
          {language === "en" ? "NL" : "EN"}
        </button>
      </div>

      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-300 rounded-full opacity-40" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-green-300 rounded-full opacity-30" />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-purple-300 rounded-full opacity-35" />

      {/* Main Auth Card */}
      <div className="relative bg-white rounded-3xl shadow-lg border-4 border-purple-300 p-8 md:p-10 w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-block p-6 mb-2 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300 shadow-sm">
            <img src="/fox.png" alt="LexiPlay Logo" className="w-24 h-24 md:w-28 md:h-28 mx-auto" />
          </div>
          <h1 className="text-4xl font-black text-purple-700" style={{ letterSpacing: "-0.02em" }}>
            {t("auth.welcome")}
          </h1>
          <p className="text-base text-gray-600 font-medium">{t("auth.subtitle")}</p>
        </div>

        {/* Input Fields */}
        <div className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">👤 {t("auth.nameLabel")}</label>
            <input
              type="text"
              placeholder={t("auth.namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-gray-50"
            />
          </div>
<div className="relative">
  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
    🔒 {t("auth.pinLabel")}
  </label>
  <input
    type={showPin ? "text" : "password"}
    placeholder={t("auth.pinPlaceholder")}
    value={pin}
    onChange={(e) => setPin(e.target.value)}
    maxLength="10"
    className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-gray-50 pr-12"
  />
<button
  type="button"
  onClick={() => setShowPin(!showPin)}
  className="absolute right-3 top-[calc(50%+12px)] -translate-y-1/2 flex items-center text-gray-500 hover:text-gray-700"
>

    {showPin ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.228.223-2.403.637-3.5M9.879 9.879A3 3 0 1114.121 14.12m0 0L21 21m-7-7l-7-7" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    )}
  </button>
</div>


        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleLogin}
            className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-4 px-6 rounded-xl text-lg font-bold shadow-md border-b-4 border-indigo-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            🔑 {t("auth.login")}
          </button>
          <button
            onClick={handleRegister}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-xl text-lg font-bold shadow-md border-b-4 border-green-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            ✨ {t("auth.register")}
          </button>
        </div>

        {/* Pin vergeten */}
        <button
          onClick={() => setShowResetModal(true)}
          className="mt-2 w-full text-sm text-purple-700 underline hover:text-purple-900"
        >
          🔑 {t("auth.forgotPin")}
        </button>

        {/* Guest */}
        {/* <button
          onClick={handleGuest}
          className="w-full bg-white hover:bg-purple-50 text-purple-600 py-4 px-6 rounded-xl text-lg font-bold border-2 border-purple-400 hover:border-purple-500 shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
        >
          🎮 {t("auth.guest")}
        </button> */}

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-100 border-2 border-red-300 rounded-xl p-4 flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="text-red-700 font-bold text-sm leading-relaxed">{error}</p>
            </div>
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

      <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
}
