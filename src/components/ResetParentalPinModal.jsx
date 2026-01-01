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
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-black text-center mb-6">
            🔁 {t("modals.resetPin.title")}
          </h2>

          <input
            placeholder={t("modals.resetPin.recoveryCode")}
            value={recoveryCode}
            onChange={(e) => setRecoveryCode(e.target.value)}
            className="w-full mb-4 px-4 py-3 rounded-xl border"
          />

          <input
            type="password"
            placeholder={t("modals.resetPin.newPin")}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            className="w-full mb-6 px-4 py-3 rounded-xl border"
          />

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 py-3 rounded-xl font-bold"
            >
              {t("modals.resetPin.closeButton")}
            </button>

            <button
              onClick={handleResetPin}
              className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold"
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
