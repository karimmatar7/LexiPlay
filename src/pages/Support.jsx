import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import SupportForm from "../components/SupportForm";
import SupportModal from "./../components/SupportModal";

export default function Support() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [modal, setModal] = useState({ open: false, title: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (form) => {
    setLoading(true);

    try {
      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        {
          to_email: process.env.REACT_APP_SUPPORT_TO_EMAIL,
          user_email: form.email,
          subject: form.subject,
          message: form.message,
          from_name: form.email,
        },
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY
      );

      setModal({
        open: true,
        title: t("support.successTitle") || "Success!",
        message: t("support.successMessage") || "Your message has been sent.",
      });
    } catch (error) {
      console.error("EmailJS error:", error);
      setModal({
        open: true,
        title: t("support.errorTitle") || "Error",
        message: t("support.errorMessage") || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-rose-50 p-4 sm:p-6 flex items-center justify-center">
      <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-md border-2 relative">
        <button
          onClick={() => navigate("/settings")}
          className="absolute top-4 left-4 flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full font-bold text-gray-700 shadow-sm transition"
        >
          <span className="text-xl">⬅️</span>
          <span>{t("support.back")}</span>
        </button>

        <div className="text-center mt-8">
          <h1 className="text-3xl sm:text-4xl font-black text-rose-700 mb-3">
            {t("support.title")}
          </h1>
          <p className="text-gray-600 mb-6">{t("support.subtitle")}</p>
        </div>

        <SupportForm loading={loading} onSubmit={handleSubmit} />

        {modal.open && (
          <SupportModal
            title={modal.title}
            message={modal.message}
            onClose={() => setModal({ ...modal, open: false })}
          />
        )}
      </div>
    </div>
  );
}
