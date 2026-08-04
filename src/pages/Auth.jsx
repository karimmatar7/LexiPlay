import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSettings } from "../context/SettingsContext.jsx";
import {
  getCurrentProfile,
  sendPasswordResetEmail,
  signInUser,
  signInWithGoogle,
  signUpUser,
} from "../utils/auth.js";
import googleIcon from "../assets/icons/google.svg";

export default function AuthPage({ onLogin }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = useSettings();

  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const currentLanguage = (
    language ||
    i18n.resolvedLanguage ||
    i18n.language ||
    "en"
  )
    .split("-")[0]
    .toLowerCase();

  const languageCode =
    currentLanguage === "nl"
      ? "NL"
      : currentLanguage === "fr"
        ? "FR"
        : "EN";

  const changeLanguage = async () => {
    const nextLanguage =
      currentLanguage === "en"
        ? "nl"
        : currentLanguage === "nl"
          ? "fr"
          : "en";

    setLanguage(nextLanguage);
    await i18n.changeLanguage(nextLanguage);
  };

  const getErrorMessage = (err) => {
    const lowerMessage = err?.message?.toLowerCase() || "";

    if (err?.message === "EMAIL_ALREADY_EXISTS") {
      return t("auth.errors.emailAlreadyRegistered");
    }

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

    if (userLanguage && userLanguage !== currentLanguage) {
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

      await signInUser({
        email: email.trim(),
        password,
      });

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
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });

      if (!user) {
        throw new Error(t("auth.errors.registerFailed"));
      }

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

      await sendPasswordResetEmail(email.trim());
      setMessage(t("auth.messages.resetEmailSent"));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      await signInWithGoogle();
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

  const switchMode = () => {
    setMode((currentMode) =>
      currentMode === "login" ? "register" : "login",
    );

    setError("");
    setMessage("");
    setPassword("");
    setShowPassword(false);
  };

  const isLogin = mode === "login";

  return (
    <main className="min-h-screen bg-[#faf9fc] text-slate-900">
      {/* Navigation */}
     <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
  <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-8 lg:px-10">
    <button
      type="button"
      onClick={() => navigate("/")}
      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 text-sm font-bold text-slate-700 transition hover:border-purple-300 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 sm:px-4"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m15 18-6-6 6-6"
        />
      </svg>

      <span>{t("auth.back")}</span>
    </button>

    <button
      type="button"
      onClick={changeLanguage}
      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 text-sm font-bold text-slate-700 transition hover:border-purple-300 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
      aria-label={t("changeLanguage")}
      title={t("changeLanguage")}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"
        />
      </svg>

      {languageCode}
    </button>
  </nav>
</header>

      {/* Main authentication layout */}
      <section className="mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-7xl items-center gap-8 px-4 py-6 sm:min-h-[calc(100vh-80px)] sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(420px,500px)] lg:gap-14 lg:px-10 lg:py-12 xl:gap-20">
        {/* Branding panel */}
        <aside className="hidden lg:block">
          <div className="max-w-xl">
            <div className="relative flex h-72 w-72 items-center justify-center rounded-full bg-purple-100 xl:h-80 xl:w-80">
              <div className="absolute inset-5 rounded-full border border-purple-200" />

              <span className="absolute left-6 top-20 h-4 w-4 rounded-full bg-amber-300" />
              <span className="absolute bottom-16 right-8 h-4 w-4 rounded-full bg-pink-300" />
              <span className="absolute right-16 top-10 h-3 w-3 rounded-full bg-indigo-300" />

              <div className="flex h-52 w-52 items-center justify-center rounded-full bg-white shadow-[0_20px_50px_rgba(88,28,135,0.12)] xl:h-60 xl:w-60">
                <img
                  src="/fox.png"
                  alt={t("auth.logoAlt")}
                  className="h-40 w-40 object-contain xl:h-44 xl:w-44"
                />
              </div>
            </div>

            <p className="mt-8 text-sm font-black uppercase tracking-[0.16em] text-purple-600">
              {isLogin
                ? t("auth.loginEyebrow")
                : t("auth.registerEyebrow")}
            </p>

            <h1 className="mt-4 max-w-xl text-5xl font-black leading-[1.05] tracking-[-0.045em] text-slate-950 xl:text-6xl">
              {isLogin
                ? t("auth.welcome")
                : t("auth.createAccountTitle")}
            </h1>

            <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">
              {isLogin
                ? t("auth.subtitle")
                : t("auth.createAccountSubtitle")}
            </p>
          </div>
        </aside>

        {/* Authentication card */}
        <div className="mx-auto w-full max-w-md lg:max-w-none">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-8 lg:p-9">
            {/* Mobile fox and title */}
            <header className="mb-7 text-center lg:text-left">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 lg:hidden">
                <img
                  src="/fox.png"
                  alt={t("auth.logoAlt")}
                  className="h-14 w-14 object-contain"
                />
              </div>

              <h2 className="text-3xl font-black tracking-[-0.03em] text-slate-950 sm:text-4xl lg:text-3xl">
                {isLogin
                  ? t("auth.welcome")
                  : t("auth.createAccountTitle")}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                {isLogin
                  ? t("auth.subtitle")
                  : t("auth.createAccountSubtitle")}
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-1.5 block text-sm font-bold text-slate-700"
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
                    disabled={loading}
                    className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-bold text-slate-700"
                >
                  {t("auth.emailLabel")}
                </label>

                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="email"
                  placeholder={t("auth.emailPlaceholder")}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={loading}
                  className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-4">
                  <label
                    htmlFor="password"
                    className="text-sm font-bold text-slate-700"
                  >
                    {t("auth.passwordLabel")}
                  </label>

                  {isLogin && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={loading}
                      className="text-xs font-bold text-purple-700 transition hover:text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                    >
                      {t("auth.forgotPassword")}
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      isLogin ? "current-password" : "new-password"
                    }
                    placeholder={t("auth.passwordPlaceholder")}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={loading}
                    className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 pr-12 text-base text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((currentValue) => !currentValue)
                    }
                    className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-purple-50 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    aria-label={
                      showPassword
                        ? t("auth.hidePassword")
                        : t("auth.showPassword")
                    }
                  >
                    {showPassword ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 3l18 18"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10.6 10.7A2 2 0 0 0 13.3 13.4"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.9 4.2A10.7 10.7 0 0 1 12 4c5.5 0 9 5 9 8a10.8 10.8 0 0 1-2.1 3.7M6.6 6.6C4.4 8 3 10.3 3 12c0 3 3.5 8 9 8a9.7 9.7 0 0 0 3.4-.6"
                        />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
                        />
                        <circle cx="12" cy="12" r="2.5" />
                      </svg>
                    )}
                  </button>
                </div>

                {!isLogin && (
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {t("auth.passwordRequirementsHint")}
                  </p>
                )}
              </div>

              {error && (
                <div
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3"
                  role="alert"
                >
                  <p className="text-sm font-semibold leading-6 text-red-700">
                    {error}
                  </p>
                </div>
              )}

              {message && (
                <div
                  className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3"
                  role="status"
                >
                  <p className="text-sm font-semibold leading-6 text-emerald-700">
                    {message}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-purple-700 px-6 font-bold text-white transition hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && (
                  <svg
                    className="h-5 w-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="3"
                    />

                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M21 12a9 9 0 0 0-9-9v3a6 6 0 0 1 6 6h3Z"
                    />
                  </svg>
                )}

                {loading
                  ? t("auth.loading")
                  : isLogin
                    ? t("auth.login")
                    : t("auth.createAccountButton")}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                {t("auth.orContinueWith")}
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-slate-300 bg-white px-5 font-bold text-slate-700 transition hover:border-purple-300 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <img
                src={googleIcon}
                alt=""
                aria-hidden="true"
                className="h-5 w-5"
              />

              {t("auth.google")}
            </button>

            <div className="mt-6 border-t border-slate-200 pt-5 text-center">
              <button
                type="button"
                onClick={switchMode}
                disabled={loading}
                className="text-sm font-bold text-purple-700 transition hover:text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLogin
                  ? t("auth.noAccount")
                  : t("auth.alreadyHaveAccount")}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}