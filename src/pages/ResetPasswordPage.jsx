import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../supaBaseClient.js";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isStrongPassword = (value) =>
    value.length >= 8 &&
    /^[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /\d/.test(value) &&
    /[!@#$%^&*()[\]{};:'"\\|,.<>/?`~_+=-]/.test(value);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setError("");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

const handleSubmit = async (event) => {
  event.preventDefault();

  if (!isStrongPassword(password)) {
    setError(t("auth.errors.passwordRequirements"));
    return;
  }

  if (password !== confirmPassword) {
    setError(t("resetPassword.errors.passwordsDoNotMatch"));
    return;
  }

  try {
    setLoading(true);
    setError("");

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      throw updateError;
    }

    window.location.replace("/menu");
  } catch (err) {
    setError(
      err.message ||
        "Could not update your password. Please request a new reset link."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 p-4">
      <main className="relative w-full max-w-md space-y-7 rounded-3xl border border-purple-100 bg-white/95 p-6 shadow-[0_25px_60px_rgba(147,51,234,0.15)] backdrop-blur-sm sm:p-8 md:p-10">
        <header className="space-y-3 text-center">
          <div className="inline-flex items-center justify-center rounded-full border border-purple-200 bg-gradient-to-br from-purple-100 to-pink-100 p-5">
            <img
              src="/fox.png"
              alt={t("auth.logoAlt")}
              className="h-20 w-20"
            />
          </div>

          <h1 className="text-3xl font-black text-purple-700">
            {t("resetPassword.title")}
          </h1>

          <p className="text-sm font-medium text-gray-600">
            {t("resetPassword.subtitle")}
          </p>
        </header>

       <form onSubmit={handleSubmit} className="flex flex-col gap-5">
  <div>
    <label
      htmlFor="newPassword"
      className="mb-1.5 ml-1 block text-sm font-bold text-gray-700"
    >
      {t("resetPassword.newPassword")}
    </label>

    <div className="relative">
      <input
        id="newPassword"
        type={showPassword ? "text" : "password"}
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder={t("auth.passwordPlaceholder")}
        className="w-full rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3.5 pr-12 text-base focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
      />

      <button
        type="button"
        onClick={() => setShowPassword((current) => !current)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600"
        aria-label={
          showPassword ? t("auth.hidePassword") : t("auth.showPassword")
        }
      >
        {showPassword ? "◉" : "○"}
      </button>
    </div>
  </div>

  <div>
    <label
      htmlFor="confirmPassword"
      className="mb-1.5 ml-1 block text-sm font-bold text-gray-700"
    >
      {t("resetPassword.confirmPassword")}
    </label>

    <input
      id="confirmPassword"
      type={showPassword ? "text" : "password"}
      autoComplete="new-password"
      value={confirmPassword}
      onChange={(event) => setConfirmPassword(event.target.value)}
      placeholder={t("resetPassword.confirmPasswordPlaceholder")}
      className="w-full rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3.5 text-base focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
    />
  </div>

  {error && (
    <div
      className="rounded-2xl border border-red-200 bg-red-50 p-4"
      role="alert"
    >
      <p className="text-sm font-semibold text-red-700">{error}</p>
    </div>
  )}

  <button
    type="submit"
    disabled={loading}
    className="rounded-full bg-indigo-500 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(99,102,241,0.35)] transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
  >
    {loading ? t("auth.loading") : t("resetPassword.savePassword")}
  </button>
</form>
      </main>
    </div>
  );
}