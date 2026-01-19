import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sha256 } from "js-sha256";
import { useTranslation } from "react-i18next";
import { useSettings } from "../context/SettingsContext";

import { getUser, updateSettings } from "../utils/user.js";
import NotificationModal from "../components/NotificationModal";
import ResetParentalPinModal from "../components/ResetParentalPinModal.jsx";
import EyeIcon from "@heroicons/react/24/outline/EyeIcon";
import EyeSlashIcon from "@heroicons/react/24/outline/EyeSlashIcon";

export default function ParentalUnlockPage({ user, setUnlocked }) {
  const { t } = useTranslation();
      const { fontType, fontSize } = useSettings(); 
        const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans";
  const sizeMap = { small: "text-base", medium: "text-lg", large: "text-xl" };
  const navigate = useNavigate();

  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [existingPin, setExistingPin] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ message: "", type: "error" });
  const [showResetModal, setShowResetModal] = useState(false);

  // Fetch user data
  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return;
      const latestUser = await getUser(user.id);
      const settings = latestUser?.settings || {};

      setExistingPin(settings.parentalPin || null);
      setAttempts(settings.parentalAttempts || 0);
      setLockUntil(settings.parentalLockUntil || null);
    }
    fetchData();
  }, [user]);

  const isLocked = lockUntil && Date.now() < lockUntil;

  const handleUnlock = async () => {
    if (isLocked) {
      const mins = Math.ceil((lockUntil - Date.now()) / 60000);
      setModalConfig({ message: t("parentalUnlock.locked", { minutes: mins }), type: "error" });
      setShowModal(true);
      return;
    }

    if (pin.length < 4) {
      setModalConfig({ message: t("parentalUnlock.errorShortPin"), type: "error" });
      setShowModal(true);
      return;
    }

    const hashedPin = sha256(pin);

    // First time setup
    if (!existingPin) {
      await updateSettings(user.id, { parentalPin: hashedPin, parentalAttempts: 0, parentalLockUntil: null });
      setExistingPin(hashedPin);
      setPin("");
      setModalConfig({ message: t("parentalUnlock.successPinSet"), type: "success" });
      setShowModal(true);
      return;
    }

    // Correct PIN
    if (hashedPin === existingPin) {
      await updateSettings(user.id, { parentalAttempts: 0, parentalLockUntil: null });
      setUnlocked?.(true);
      navigate("/parental-control");
      return;
    }

    // Wrong PIN
    const newAttempts = attempts + 1;
    let lockTime = null;
    if (newAttempts >= 5) lockTime = Date.now() + Math.min((newAttempts - 4) * 5, 30) * 60000;

    await updateSettings(user.id, { parentalAttempts: newAttempts, parentalLockUntil: lockTime });
    setAttempts(newAttempts);
    setLockUntil(lockTime);
    setPin("");

    setModalConfig({
      message: lockTime ? t("parentalUnlock.tooManyAttempts") : t("parentalUnlock.errorWrongPin"),
      type: "error",
    });
    setShowModal(true);
  };

  return (
    <div className={`min-h-screen bg-indigo-50 p-6 relative ${fontClass} ${sizeMap[fontSize]}`}>
      <div className="max-w-2xl mx-auto text-center">
        <span className="text-7xl">🔐</span>
        <h1 className="text-5xl font-black text-indigo-700 mt-4">
          {existingPin ? t("parentalUnlock.enterPinTitle") : t("parentalUnlock.setPinTitle")}
        </h1>

        {/* PIN Input */}
   <div className="bg-white rounded-3xl p-6 my-6 w-full max-w-md mx-auto">
  <label className="block text-lg font-bold mb-2">
    {existingPin ? t("parentalUnlock.pinLabelEnter") : t("parentalUnlock.pinLabelNew")}
  </label>

  <div className="relative">
    <input
      type={showPin ? "text" : "password"}
      value={pin}
      onChange={(e) => setPin(e.target.value)}
      className="w-full px-4 py-3 text-xl rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-12 transition-all"
      maxLength={6}
      disabled={isLocked}
    />
    <button
      type="button"
      onClick={() => setShowPin(!showPin)}
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-600"
      aria-label={showPin ? "Hide PIN" : "Show PIN"}
    >
      {showPin ? (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a10.05 10.05 0 012.347-3.569M6.21 6.21a9.966 9.966 0 0113.58 0M3 3l18 18" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  </div>
</div>


        {existingPin && (
          <button onClick={() => setShowResetModal(true)} className="mb-4 text-sm text-purple-700 underline w-full">
            🔁 {t("parentalUnlock.forgotPin")}
          </button>
        )}

        {/* Buttons */}
        <div className="flex gap-4">
          <button onClick={handleUnlock} disabled={isLocked} className="flex-1 bg-purple-600 text-white py-5 rounded-2xl font-bold">
            {existingPin ? "🔓" : "✨"} {existingPin ? t("parentalUnlock.buttonUnlock") : t("parentalUnlock.buttonSetPin")}
          </button>
          <button onClick={() => navigate("/menu")} className="flex-1 bg-gray-400 text-white py-5 rounded-2xl font-bold">
            🏠 {t("parentalUnlock.backToMenu")}
          </button>
        </div>
      </div>

      {/* Reset PIN Modal */}
      {showResetModal && (
        <ResetParentalPinModal
          user={user}
          onClose={() => setShowResetModal(false)}
          setExistingPin={setExistingPin}
          setPin={setPin}
        />
      )}

      {/* Notification */}
      <NotificationModal
        show={showModal}
        onClose={() => setShowModal(false)}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  );
}
