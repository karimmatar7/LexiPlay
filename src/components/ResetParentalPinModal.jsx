import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../supaBaseClient.js";
import NotificationModal from "./NotificationModal";

export default function ResetParentalPinModal({ onClose }) {
  const { t } = useTranslation();

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

  const handleSendResetEmail = async () => {
    try {
      setLoading(true);

      // Confirms the user is still authenticated with Supabase.
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Your session has expired. Please log in again.");
      }

      // Retrieves the current access token to authenticate the Edge Function request.
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const { data, error } = await supabase.functions.invoke(
        "send-parental-pin-reset",
        {
          body: {},
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) {
        throw new Error(error.message || "Could not send the reset email.");
      }

      if (!data?.success) {
        throw new Error(
          data?.error || "Could not send the reset email. Please try again."
        );
      }

      showMessage(
        "We sent a secure parental PIN reset link to your account email.",
        "success"
      );
    } catch (error) {
      showMessage(error.message || "Could not send the reset email.");
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

            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              We will send a secure one-time reset link to the email connected
              to this account.
            </p>
          </div>

          <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4">
            <p className="text-center text-sm font-semibold leading-relaxed text-purple-800">
              The link expires in 20 minutes and can be used only once.
            </p>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="order-2 flex-1 rounded-full border border-gray-200 bg-white py-3.5 font-bold text-gray-600 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:order-1"
            >
              {t("modals.resetPin.closeButton")}
            </button>

            <button
              type="button"
              onClick={handleSendResetEmail}
              disabled={loading}
              className="order-1 flex-1 rounded-full bg-purple-600 py-3.5 font-bold text-white shadow-[0_8px_20px_rgba(147,51,234,0.35)] transition-all hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-purple-400 sm:order-2"
            >
              {loading ? "Sending..." : "Send reset link"}
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