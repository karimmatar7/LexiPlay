import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageButton from "../components/LanguageButton";

const features = [
  {
    key: "one",
    titleKey: "landing.featureOneTitle",
    descriptionKey: "landing.featureOneText",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 19.5V6.8c0-.9.7-1.6 1.6-1.6H11c1 0 1.8.8 1.8 1.8v12.5"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 19.5V6.8c0-.9-.7-1.6-1.6-1.6H13c-1 0-1.8.8-1.8 1.8v12.5"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 19.5h5.2c1.5 0 2.8.6 3.8 1.5 1-.9 2.3-1.5 3.8-1.5H20"
        />
      </svg>
    ),
  },
  {
    key: "two",
    titleKey: "landing.featureTwoTitle",
    descriptionKey: "landing.featureTwoText",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21s7-4.2 7-10.1A4.4 4.4 0 0 0 12 7.4 4.4 4.4 0 0 0 5 10.9C5 16.8 12 21 12 21Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m9.5 12 1.7 1.7 3.5-3.7"
        />
      </svg>
    ),
  },
  {
    key: "three",
    titleKey: "landing.featureThreeTitle",
    descriptionKey: "landing.featureThreeText",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 19V9m7 10V5m7 14v-7"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 19h18"
        />
      </svg>
    ),
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-[#faf9fc] text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-8 lg:px-10">
          {/* Decorative logo */}
          <div
            className="flex items-center gap-2.5"
            aria-label={t("landing.homeAriaLabel")}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
              <img
                src="/fox.png"
                alt=""
                aria-hidden="true"
                className="h-7 w-7 object-contain"
              />
            </div>

            <span className="text-lg font-black tracking-tight text-purple-900">
              Lexi<span className="text-indigo-600">Play</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageButton labelKey="landing.changeLanguage" />

            <button
              type="button"
              onClick={() => navigate("/auth")}
              className="hidden min-h-10 items-center justify-center rounded-full bg-purple-700 px-5 text-sm font-bold text-white transition hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 sm:inline-flex"
            >
              {t("landing.login")}
            </button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-8 sm:px-8 sm:py-12 lg:min-h-[calc(100vh-80px)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-10 lg:py-14">
        {/* Illustration */}
        <div className="order-1 flex items-center justify-center lg:order-2">
          <div className="relative flex h-[210px] w-[210px] items-center justify-center rounded-full bg-purple-100 sm:h-[300px] sm:w-[300px] lg:h-[380px] lg:w-[380px]">
            <div className="absolute inset-4 rounded-full border border-purple-200 sm:inset-5" />

            <span className="absolute left-5 top-16 h-3.5 w-3.5 rounded-full bg-amber-300 sm:left-7 sm:top-20 sm:h-4 sm:w-4" />
            <span className="absolute bottom-14 right-6 h-3.5 w-3.5 rounded-full bg-pink-300 sm:bottom-20 sm:right-8 sm:h-4 sm:w-4" />
            <span className="absolute right-11 top-7 h-2.5 w-2.5 rounded-full bg-indigo-300 sm:right-16 sm:top-10 sm:h-3 sm:w-3" />

            <div className="flex h-36 w-36 items-center justify-center rounded-full bg-white shadow-[0_18px_45px_rgba(88,28,135,0.12)] sm:h-52 sm:w-52 lg:h-64 lg:w-64">
              <img
                src="/fox.png"
                alt={t("landing.foxAlt")}
                className="landing-fox h-28 w-28 object-contain sm:h-40 sm:w-40 lg:h-48 lg:w-48"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="order-2 mx-auto w-full max-w-2xl text-center lg:order-1 lg:mx-0 lg:text-left">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-purple-600 sm:text-sm">
            {t("landing.eyebrow")}
          </p>

          <h1 className="mt-3 text-4xl font-black leading-[1.05] tracking-[-0.045em] text-slate-950 sm:mt-5 sm:text-5xl lg:text-6xl">
            {t("landing.titleFirst")}

            <span className="block text-purple-700">
              {t("landing.titleAccent")}
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm font-medium leading-6 text-slate-600 sm:mt-6 sm:text-lg sm:leading-7 lg:mx-0">
            {t("landing.description")}
          </p>

          {/* Primary actions */}
          <div className="mt-6 flex flex-col justify-center gap-3 sm:mt-8 sm:flex-row lg:justify-start">
            <button
              type="button"
              onClick={() => navigate("/auth")}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-purple-700 px-7 py-3.5 font-bold text-white transition hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 sm:w-auto"
            >
              {t("landing.getStarted")}

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
                  d="m9 18 6-6-6-6"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => navigate("/why-lexiplay")}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-3.5 font-bold text-slate-700 transition hover:border-purple-300 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 sm:w-auto"
            >
              {t("landing.whyLexiPlay")}

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
                  d="M14 5h5v5M10 14 19 5"
                />
              </svg>
            </button>
          </div>

          {/* Feature summary */}
          <div className="mt-8 grid grid-cols-3 gap-2 sm:mt-10 sm:gap-4">
            {features.map((feature) => (
              <article
                key={feature.key}
                className="flex min-w-0 flex-col items-center rounded-2xl border border-slate-200 bg-white px-2 py-4 text-center sm:items-start sm:p-5 sm:text-left"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700 sm:h-10 sm:w-10">
                  {feature.icon}
                </div>

                <h2 className="mt-3 text-xs font-black leading-5 text-slate-900 sm:text-sm">
                  {t(feature.titleKey)}
                </h2>

                <p className="mt-2 hidden text-sm leading-6 text-slate-600 sm:block">
                  {t(feature.descriptionKey)}
                </p>
              </article>
            ))}
          </div>

          {/* Mobile login */}
          <p className="mt-6 text-sm text-slate-500 sm:hidden">
            {t("landing.alreadyHaveAccount")}{" "}
            <button
              type="button"
              onClick={() => navigate("/auth")}
              className="font-bold text-purple-700 underline decoration-purple-300 underline-offset-4 transition hover:text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
            >
              {t("landing.login")}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}