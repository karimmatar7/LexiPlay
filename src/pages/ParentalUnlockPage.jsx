import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sha256 } from "js-sha256";
import { useTranslation } from "react-i18next";
import { useSettings } from "../context/SettingsContext";
import AppButton from "../components/AppButton";

import { getUser, updateSettings } from "../utils/user.js";
import NotificationModal from "../components/NotificationModal";
import ResetParentalPinModal from "../components/ResetParentalPinModal.jsx";
import lockIcon from "../assets/icons/lock.png";
import homeIcon from "../assets/icons/home.png";
import unlockIcon from "../assets/icons/unlock.png";
import loopIcon from "../assets/icons/loop.png";

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
    <div
      className={`min-h-screen bg-gradient-to-b from-indigo-50 via-indigo-50 to-purple-50 p-4 sm:p-6 relative overflow-hidden ${fontClass} ${sizeMap[fontSize]}`}
    >
      <div className="relative max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center mb-4 bg-white rounded-3xl p-5 sm:p-6 shadow-[0_14px_30px_rgba(79,70,229,0.15)] border-4 border-indigo-100">
          <img
            src={lockIcon}
            alt=""
            aria-hidden="true"
            draggable="false"
            className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
          />
        </div>

        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-black text-indigo-700"
          style={{ letterSpacing: "-0.02em" }}
        >
          {existingPin ? t("parentalUnlock.enterPinTitle") : t("parentalUnlock.setPinTitle")}
        </h1>

        {/* PIN Input */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-[0_20px_45px_rgba(15,23,42,0.06)] border border-indigo-100 p-5 sm:p-6 my-6 w-full max-w-md mx-auto text-left">
          <label className="block text-sm sm:text-base font-bold text-gray-700 mb-2">
            {existingPin ? t("parentalUnlock.pinLabelEnter") : t("parentalUnlock.pinLabelNew")}
          </label>

          <div className="relative">
            <input
              type={showPin ? "text" : "password"}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-3.5 text-lg sm:text-xl tracking-widest rounded-2xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 pr-12 transition-all"
              maxLength={6}
              disabled={isLocked}
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
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

          {existingPin && (
            <button
              onClick={() => setShowResetModal(true)}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-800 transition-colors"
            >
              <img
                src={loopIcon}
                alt=""
                aria-hidden="true"
                draggable="false"
                className="h-4 w-4 object-contain"
              />
              <span>{t("parentalUnlock.forgotPin")}</span>
            </button>
          )}
        </div>

        {/* Buttons */}
 {/* Buttons */}
<div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row sm:gap-4">
  <AppButton
    type="button"
    onClick={handleUnlock}
    disabled={isLocked}
    variant="indigo"
    className="flex-1 bg-purple-600 text-sm hover:bg-purple-700 sm:text-base"
  >
    <img
      src={existingPin ? unlockIcon : lockIcon}
      alt=""
      aria-hidden="true"
      draggable="false"
      className="h-5 w-5 shrink-0 object-contain"
    />

    <span>
      {existingPin
        ? t("parentalUnlock.buttonUnlock")
        : t("parentalUnlock.buttonSetPin")}
    </span>
  </AppButton>

  <AppButton
    type="button"
    onClick={() => navigate("/menu")}
    variant="neutral"
    className="flex-1 text-sm sm:text-base"
  >
    <img
      src={homeIcon}
      alt=""
      aria-hidden="true"
      draggable="false"
      className="h-5 w-5 shrink-0 object-contain"
    />

    <span>{t("parentalUnlock.backToMenu")}</span>
  </AppButton>
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