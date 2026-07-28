import React, { useState } from "react";
import { sha256 } from "js-sha256";
import { useTranslation } from "react-i18next";
import { supabase } from "../supaBaseClient.js";
import { updateSettings } from "../utils/user.js";
import NotificationModal from "./NotificationModal";

export default function ResetParentalPinModal({
  user,
  onClose,
  setExistingPin,
  setPin,
}) {
  const { t } = useTranslation();

  const [password, setPassword] = useState("");
  const [newPin, setNewPin] = useState("");
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    message: "",
    type: "error",
  });

  const showMessage = (message, type = "error") => {
    setModalConfig({ message, type });
    setShowModal(true);
  };

  const handleResetPin = async () => {
    if (!password) {
      showMessage("Enter your account password.");
      return;
    }

    if (newPin.length < 4) {
      showMessage(t("parentalUnlock.errorShortPin"));
      return;
    }

    try {
      setLoading(true);

      // The user does not type an email; we use the logged-in user's email.
     const {
  data: { user: authUser },
  error: authUserError,
} = await supabase.auth.getUser();

if (authUserError || !authUser?.email) {
  throw new Error("Could not verify your signed-in account. Please log in again.");
}

const { data, error: signInError } =
  await supabase.auth.signInWithPassword({
    email: authUser.email,
    password,
  });

      if (signInError || !data.user) {
        throw new Error("Password is incorrect.");
      }

  if (data.user.id !== authUser.id || data.user.id !== user.id) {
  throw new Error("This password does not belong to the current account.");
}
      const hashedPin = sha256(newPin);

      const updatedUser = await updateSettings(user.id, {
        parentalPin: hashedPin,
        parentalAttempts: 0,
        parentalLockUntil: null,
      });

      if (!updatedUser) {
        throw new Error("Could not reset the parental PIN. Try again.");
      }

      // Make the new PIN work immediately without a page refresh.
      setExistingPin(hashedPin);
      setPin("");

      showMessage("Parental PIN reset successfully.", "success");

      window.setTimeout(() => {
        setShowModal(false);
        onClose();
      }, 1500);
    } catch (error) {
      showMessage(error.message || "Could not reset the parental PIN.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_25px_60px_rgba(15,23,42,0.25)] sm:p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 inline-flex items-center justify-center rounded-2xl border border-purple-100 bg-purple-50 p-3">
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

            <h2 className="text-xl font-black text-gray-900 sm:text-2xl">
              Reset parental PIN
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Enter your account password to create a new parental PIN.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="account-password"
                className="mb-1.5 block text-sm font-bold text-gray-700"
              >
                Account password
              </label>

              <input
                id="account-password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your account password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={loading}
                className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 transition-all focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="new-parental-pin"
                className="mb-1.5 block text-sm font-bold text-gray-700"
              >
                New parental PIN
              </label>

              <input
                id="new-parental-pin"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                placeholder="4 to 6 digits"
                value={newPin}
                onChange={(event) =>
                  setNewPin(event.target.value.replace(/\D/g, ""))
                }
                maxLength={6}
                disabled={loading}
                className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 tracking-widest transition-all focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="order-2 flex-1 rounded-full border border-gray-200 bg-white py-3 font-bold text-gray-600 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:order-1"
            >
              {t("modals.resetPin.closeButton")}
            </button>

            <button
              type="button"
              onClick={handleResetPin}
              disabled={loading}
              className="order-1 flex-1 rounded-full bg-purple-600 py-3 font-bold text-white shadow-[0_8px_20px_rgba(147,51,234,0.35)] transition-all hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-purple-400 sm:order-2"
            >
              {loading ? "Checking..." : "Reset PIN"}
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