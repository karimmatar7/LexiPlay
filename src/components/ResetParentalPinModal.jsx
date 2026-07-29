// src/components/ResetParentalPinModal.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../supaBaseClient.js";
import NotificationModal from "./NotificationModal";
import AppButton from "./AppButton";

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

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(t("resetParentalPinModal.errors.sessionExpired"));
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error(t("resetParentalPinModal.errors.sessionExpired"));
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
        throw new Error(
          error.message || t("resetParentalPinModal.errors.sendFailed")
        );
      }

      if (!data?.success) {
        throw new Error(
          data?.error || t("resetParentalPinModal.errors.sendFailed")
        );
      }

      showMessage(t("resetParentalPinModal.success"), "success");
    } catch (error) {
      showMessage(
        error.message || t("resetParentalPinModal.errors.sendFailed")
      );
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
              {t("resetParentalPinModal.title")}
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {t("resetParentalPinModal.subtitle")}
            </p>
          </div>

          <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4">
            <p className="text-center text-sm font-semibold leading-relaxed text-purple-800">
              {t("resetParentalPinModal.expiryNotice")}
            </p>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <AppButton
              type="button"
              onClick={onClose}
              disabled={loading}
              variant="neutral"
              className="order-2 flex-1 sm:order-1"
            >
              {t("modals.resetPin.closeButton")}
            </AppButton>

            <AppButton
              type="button"
              onClick={handleSendResetEmail}
              disabled={loading}
              variant="indigo"
              className="order-1 flex-1 sm:order-2"
            >
              {loading
                ? t("resetParentalPinModal.sending")
                : t("resetParentalPinModal.sendButton")}
            </AppButton>
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