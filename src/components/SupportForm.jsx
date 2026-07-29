import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import AppButton from "./AppButton";

export default function SupportForm({ loading, onSubmit }) {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <InputField
        label={t("support.email")}
        name="email"
        type="email"
        placeholder={t("support.emailPlaceholder")}
        value={form.email}
        onChange={handleChange}
        required
      />

      <InputField
        label={t("support.subject")}
        name="subject"
        type="text"
        placeholder={t("support.subjectPlaceholder")}
        value={form.subject}
        onChange={handleChange}
        required
      />

      <TextAreaField
        label={t("support.message")}
        name="message"
        rows={5}
        placeholder={t("support.messagePlaceholder")}
        value={form.message}
        onChange={handleChange}
        required
      />

      <AppButton
        type="submit"
        variant="indigo"
        size="lg"
        disabled={loading}
        className="w-full"
      >
        {loading ? t("support.sending") : t("support.send")}
      </AppButton>
    </form>
  );
}

function InputField({ label, ...props }) {
  return (
    <div>
      <label className="mb-2 block font-bold">{label}</label>

      <input
        {...props}
        className="w-full rounded-xl border-2 p-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
    </div>
  );
}

function TextAreaField({ label, ...props }) {
  return (
    <div>
      <label className="mb-2 block font-bold">{label}</label>

      <textarea
        {...props}
        className="w-full resize-none rounded-xl border-2 p-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
    </div>
  );
}