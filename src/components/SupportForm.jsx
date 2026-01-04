import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export default function SupportForm({ loading, onSubmit }) {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-4 rounded-2xl font-bold transition ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-500 hover:bg-indigo-600 text-white"
        }`}
      >
        {loading ? t("support.sending") : t("support.send")}
      </button>
    </form>
  );
}

function InputField({ label, ...props }) {
  return (
    <div>
      <label className="block font-bold mb-2">{label}</label>
      <input
        {...props}
        className="w-full p-4 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
    </div>
  );
}

function TextAreaField({ label, ...props }) {
  return (
    <div>
      <label className="block font-bold mb-2">{label}</label>
      <textarea
        {...props}
        className="w-full p-4 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
      />
    </div>
  );
}
