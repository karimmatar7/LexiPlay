import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSettings } from "../context/SettingsContext.jsx";
import {
  getCurrentProfile,
  sendPasswordResetEmail,
  signInUser,
  signInWithApple,
  signInWithGoogle,
  signUpUser,
} from "../utils/auth.js";
import googleIcon from "../assets/icons/google.svg";
import appleIcon from "../assets/icons/apple.svg";

export default function AuthPage({ onLogin }) {
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = useSettings();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleLanguage = () => {
    const nextLanguage =
      language === "en" ? "nl" : language === "nl" ? "fr" : "en";

    setLanguage(nextLanguage);
    i18n.changeLanguage(nextLanguage);
  };

  const getErrorMessage = (err) => {
    const lowerMessage = err?.message?.toLowerCase() || "";

    if (lowerMessage.includes("invalid login credentials")) {
      return t("auth.errors.loginFailed");
    }

    if (lowerMessage.includes("already registered")) {
      return t("auth.errors.emailAlreadyRegistered");
    }

    if (lowerMessage.includes("email not confirmed")) {
      return t("auth.errors.emailNotConfirmed");
    }

    return err?.message || t("auth.errors.somethingWentWrong");
  };

  const applyUserLanguage = async (user) => {
    const userLanguage = user?.settings?.language;

    if (userLanguage && userLanguage !== language) {
      setLanguage(userLanguage);
      await i18n.changeLanguage(userLanguage);
    }
  };

  const isStrongPassword = (value) => {
  return (
    value.length >= 8 &&
    /^[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /\d/.test(value) &&
    /[!@#$%^&*()[\]{};:'"\\|,.<>/?`~_+=-]/.test(value)
  );
};

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError(t("auth.errors.emailAndPasswordRequired"));
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      await signInUser({ email, password });

      const profile = await getCurrentProfile();

      if (!profile) {
        throw new Error(t("auth.errors.profileLoadFailed"));
      }

      await applyUserLanguage(profile);

      onLogin(profile);
      navigate("/menu");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      setError(t("auth.errors.allFieldsRequired"));
      return;
    }

  if (!isStrongPassword(password)) {
  setError(t("auth.errors.passwordRequirements"));
  return;
}

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const { user, session } = await signUpUser({
        fullName,
        email,
        password,
      });

      if (!user) {
        throw new Error(t("auth.errors.registerFailed"));
      }

      // If Confirm email is disabled in Supabase, login happens immediately.
      if (session) {
        const profile = await getCurrentProfile();

        if (!profile) {
          throw new Error(t("auth.errors.profileLoadFailed"));
        }

        await applyUserLanguage(profile);
        onLogin(profile);
        navigate("/menu");
        return;
      }

      setMode("login");
      setPassword("");
      setMessage(t("auth.messages.confirmEmail"));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError(t("auth.errors.emailRequiredForReset"));
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      await sendPasswordResetEmail(email);

      setMessage(t("auth.messages.resetEmailSent"));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
  try {
    setLoading(true);
    setError("");
    setMessage("");

    if (provider === "google") {
      await signInWithGoogle();
      return;
    }

    await signInWithApple();
  } catch (err) {
    setError(getErrorMessage(err));
    setLoading(false);
  }
};

  const handleSubmit = (event) => {
    event.preventDefault();

    if (mode === "login") {
      handleLogin();
      return;
    }

    handleRegister();
  };

  const nextLanguage =
    language === "en" ? "NL" : language === "nl" ? "FR" : "EN";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 p-4">
      <div className="fixed right-4 top-4 z-50">
        <button
          type="button"
          onClick={toggleLanguage}
          className="group inline-flex min-w-[60px] items-center gap-2 rounded-full border border-purple-200 bg-white px-3.5 py-2.5 font-bold shadow-[0_8px_20px_rgba(147,51,234,0.15)] transition-all duration-200 hover:border-purple-300 hover:bg-purple-50 sm:min-w-[70px] sm:px-4"
          aria-label={t("changeLanguage")}
        >
          <svg
            className="h-5 w-5 flex-shrink-0 text-purple-600 transition-colors group-hover:text-purple-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
            />
          </svg>

          <span className="text-sm font-bold uppercase tracking-wide text-purple-700 sm:text-base">
            {language === "en" ? "EN" : language === "nl" ? "NL" : "FR"}
          </span>

          <span className="hidden text-xs font-medium text-purple-400 sm:inline">
            → {nextLanguage}
          </span>
        </button>
      </div>

      <div className="pointer-events-none absolute left-10 top-20 h-32 w-32 rounded-full bg-yellow-300 opacity-40" />
      <div className="pointer-events-none absolute bottom-20 right-10 h-40 w-40 rounded-full bg-green-300 opacity-30" />
      <div className="pointer-events-none absolute left-1/4 top-1/2 h-24 w-24 rounded-full bg-purple-300 opacity-35" />

      <main className="relative w-full max-w-md space-y-7 rounded-3xl border border-purple-100 bg-white/95 p-6 shadow-[0_25px_60px_rgba(147,51,234,0.15)] backdrop-blur-sm sm:p-8 md:p-10">
        <header className="space-y-3 text-center sm:space-y-4">
          <div className="mb-1 inline-flex items-center justify-center rounded-full border border-purple-200 bg-gradient-to-br from-purple-100 to-pink-100 p-5 shadow-[0_10px_25px_rgba(147,51,234,0.15)] sm:p-6">
            <img
              src="/fox.png"
              alt={t("auth.logoAlt")}
              className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28"
            />
          </div>

          <h1
            className="text-3xl font-black text-purple-700 sm:text-4xl"
            style={{ letterSpacing: "-0.02em" }}
          >
            {mode === "login"
              ? t("auth.welcome")
              : t("auth.createAccountTitle")}
          </h1>

          <p className="text-sm font-medium text-gray-600 sm:text-base">
            {mode === "login"
              ? t("auth.subtitle")
              : t("auth.createAccountSubtitle")}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {mode === "register" && (
            <div>
              <label
                htmlFor="fullName"
                className="mb-1.5 ml-1 block text-sm font-bold text-gray-700"
              >
                {t("auth.fullNameLabel")}
              </label>

              <input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder={t("auth.fullNamePlaceholder")}
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="w-full rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3.5 text-base transition-all duration-200 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 sm:text-lg"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 ml-1 block text-sm font-bold text-gray-700"
            >
              {t("auth.emailLabel")}
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t("auth.emailPlaceholder")}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3.5 text-base transition-all duration-200 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 sm:text-lg"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 ml-1 block text-sm font-bold text-gray-700"
            >
              {t("auth.passwordLabel")}
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                placeholder={t("auth.passwordPlaceholder")}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3.5 pr-12 text-base transition-all duration-200 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 sm:text-lg"
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-purple-600"
                aria-label={
                  showPassword
                    ? t("auth.hidePassword")
                    : t("auth.showPassword")
                }
              >
                {showPassword ? (
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.228.223-2.403.637-3.5M9.879 9.879A3 3 0 1114.121 14.12m0 0L21 21m-7-7l-7-7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 0 1 6 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div
              className="rounded-2xl border border-red-200 bg-red-50 p-4"
              role="alert"
            >
              <p className="text-sm font-semibold leading-relaxed text-red-700">
                {error}
              </p>
            </div>
          )}

          {message && (
            <div
              className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
              role="status"
            >
              <p className="text-sm font-semibold leading-relaxed text-emerald-700">
                {message}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2.5 rounded-full bg-indigo-500 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(99,102,241,0.35)] transition-all duration-200 hover:bg-indigo-600 hover:shadow-[0_10px_24px_rgba(99,102,241,0.45)] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
          >
            {loading
              ? t("auth.loading")
              : mode === "login"
                ? t("auth.login")
                : t("auth.createAccountButton")}
          </button>
        </form>

        <div className="relative flex items-center py-1">
  <div className="flex-1 border-t border-gray-200" />
  <span className="px-3 text-xs font-bold uppercase tracking-wide text-gray-400">
    {t("auth.orContinueWith")}
  </span>
  <div className="flex-1 border-t border-gray-200" />
</div>

<div className="grid grid-cols-1 gap-3">
  <button
    type="button"
    onClick={() => handleSocialLogin("google")}
    disabled={loading}
    className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-gray-200 bg-white px-4 py-3 font-bold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
  >
    <img
      src={googleIcon}
      alt=""
      aria-hidden="true"
      className="h-5 w-5 flex-shrink-0"
    />
    <span>{t("auth.google")}</span>
  </button>
</div>

        {mode === "login" && (
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={loading}
            className="w-full text-sm font-semibold text-purple-600 transition-colors hover:text-purple-800 disabled:opacity-60"
          >
            {t("auth.forgotPassword")}
          </button>
        )}

        <div className="border-t border-gray-100 pt-5 text-center">
          <button
            type="button"
            onClick={() => {
              setMode((current) =>
                current === "login" ? "register" : "login"
              );
              setError("");
              setMessage("");
              setPassword("");
            }}
            className="text-sm font-semibold text-purple-600 transition-colors hover:text-purple-800"
          >
            {mode === "login"
              ? t("auth.noAccount")
              : t("auth.alreadyHaveAccount")}
          </button>
        </div>
      </main>
    </div>
  );
}