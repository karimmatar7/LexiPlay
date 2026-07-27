import React, { useState } from "react";
import { sha256 } from "js-sha256";
import { updateSettings, getUser } from "../utils/user.js";
import NotificationModal from "./NotificationModal";
import { useTranslation } from "react-i18next";

export default function ResetParentalPinModal({ user, onClose, setExistingPin, setPin }) {
  const { t } = useTranslation();
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPin, setNewPin] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ message: "", type: "error" });

  const handleResetPin = async () => {
    if (newPin.length < 4) {
      setModalConfig({ message: t("parentalUnlock.errorShortPin"), type: "error" });
      setShowModal(true);
      return;
    }

    const latestUser = await getUser(user.id);
    const storedRecovery = latestUser?.recovery_code;

    if (!storedRecovery) {
      setModalConfig({ message: t("auth.errors.resetFailed"), type: "error" });
      setShowModal(true);
      return;
    }

    if (sha256(recoveryCode.trim()) !== storedRecovery) {
      setModalConfig({ message: t("auth.errors.resetFailed"), type: "error" });
      setShowModal(true);
      return;
    }

    // Update PIN and reset attempts
    const hashedPin = sha256(newPin);
    await updateSettings(user.id, {
      parentalPin: hashedPin,
      parentalAttempts: 0,
      parentalLockUntil: null,
    });

    // Update local state so new PIN works immediately
    setExistingPin(hashedPin);
    setPin("");

    setModalConfig({ message: t("modals.success.title"), type: "success" });
    setShowModal(true);

    // Close modal after success
    setTimeout(() => {
      setShowModal(false);
      onClose();
      setRecoveryCode("");
      setNewPin("");
    }, 1500);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-[0_25px_60px_rgba(15,23,42,0.25)] border border-gray-100 p-6 sm:p-8 w-full max-w-md">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="inline-flex items-center justify-center mb-3 bg-purple-50 rounded-2xl p-3 border border-purple-100">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-purple-600"
                aria-hidden="true"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              {t("modals.resetPin.title")}
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                {t("modals.resetPin.recoveryCode")}
              </label>
              <input
                placeholder={t("modals.resetPin.recoveryCode")}
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                {t("modals.resetPin.newPin")}
              </label>
              <input
                type="password"
                placeholder={t("modals.resetPin.newPin")}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                maxLength={6}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 tracking-widest transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-7">
            <button
              onClick={onClose}
              className="flex-1 order-2 sm:order-1 bg-white hover:bg-gray-50 text-gray-600 py-3 rounded-full font-bold border border-gray-200 hover:border-gray-300 shadow-sm transition-all duration-200"
            >
              {t("modals.resetPin.closeButton")}
            </button>

            <button
              onClick={handleResetPin}
              className="flex-1 order-1 sm:order-2 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-full font-bold shadow-[0_8px_20px_rgba(147,51,234,0.35)] hover:shadow-[0_10px_24px_rgba(147,51,234,0.45)] transition-all duration-200"
            >
              {t("modals.resetPin.resetButton")}
            </button>
          </div>
        </div>
      </div>

      <NotificationModal
        show={showModal}
        onClose={() => setShowModal(false)}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </>
  );
}