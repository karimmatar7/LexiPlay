import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSettings } from "../context/SettingsContext";
import scientificSources from "../data/scientificSources.json";

const principles = [
  {
    number: "01",
    titleKey: "why.principleOneTitle",
    descriptionKey: "why.principleOneDescription",
  },
  {
    number: "02",
    titleKey: "why.principleTwoTitle",
    descriptionKey: "why.principleTwoDescription",
  },
  {
    number: "03",
    titleKey: "why.principleThreeTitle",
    descriptionKey: "why.principleThreeDescription",
  },
  {
    number: "04",
    titleKey: "why.principleFourTitle",
    descriptionKey: "why.principleFourDescription",
  },
];

export default function WhyLexiPlay() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = useSettings();

  const [showSources, setShowSources] = useState(false);
  const closeButtonRef = useRef(null);

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

  const openSources = () => {
    setShowSources(true);
  };

  const closeSources = () => {
    setShowSources(false);
  };

  useEffect(() => {
    if (!showSources) return undefined;

    const previousOverflow = document.body.style.overflow;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeSources();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
      window.clearTimeout(focusTimer);
    };
  }, [showSources]);

  return (
    <main className="min-h-screen bg-[#faf9fc] text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center px-4 sm:h-20 sm:px-8 lg:px-10">
          {/* Small screens */}
          <div className="flex w-full items-center justify-between sm:hidden">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 text-sm font-bold text-slate-700 transition hover:border-purple-300 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
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

              {t("why.back")}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={changeLanguage}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-purple-300 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
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

              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100"
                aria-hidden="true"
              >
                <img
                  src="/fox.png"
                  alt=""
                  className="h-7 w-7 object-contain"
                />
              </div>
            </div>
          </div>

          {/* Tablet and desktop */}
          <div className="hidden w-full items-center justify-between sm:flex">
            {/* Decorative brand only */}
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100"
                aria-hidden="true"
              >
                <img
                  src="/fox.png"
                  alt=""
                  className="h-7 w-7 object-contain"
                />
              </div>

              <span className="text-lg font-black tracking-tight text-purple-900">
                Lexi<span className="text-indigo-600">Play</span>
              </span>
            </div>

            <div className="flex items-center gap-3">

                
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-purple-300 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
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

                {t("why.back")}
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


              <button
                type="button"
                onClick={() => navigate("/auth")}
                className="inline-flex min-h-10 items-center justify-center rounded-full bg-purple-700 px-5 text-sm font-bold text-white transition hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
              >
                {t("why.ctaButton")}
              </button>
            </div>
          </div>
        </nav>
      </header>

      <div className="mx-auto w-full max-w-6xl px-5 pb-28 sm:px-8 sm:pb-16 lg:px-10">
        {/* Introduction */}
        <section className="grid items-center gap-8 border-b border-slate-200 py-10 sm:py-14 lg:grid-cols-[1fr_250px] lg:py-16">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-purple-600 sm:text-sm">
              {t("why.eyebrow")}
            </p>

            <h1 className="mt-3 text-4xl font-black leading-[1.08] tracking-[-0.045em] text-slate-950 sm:mt-4 sm:text-5xl lg:text-6xl">
              {t("why.title")}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:mt-5 sm:text-lg sm:leading-8">
              {t("why.introduction")}
            </p>
          </div>

          <div className="hidden justify-end lg:flex">
            <div className="flex h-48 w-48 items-center justify-center rounded-full bg-purple-100">
              <div className="flex h-36 w-36 items-center justify-center rounded-full bg-white shadow-[0_16px_40px_rgba(88,28,135,0.1)]">
                <img
                  src="/fox.png"
                  alt=""
                  aria-hidden="true"
                  className="h-24 w-24 object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Principles */}
        <section className="py-10 sm:py-14">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-purple-600 sm:text-sm">
              {t("why.principlesEyebrow")}
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
              {t("why.principlesTitle")}
            </h2>

            <p className="mt-3 leading-7 text-slate-600 sm:mt-4">
              {t("why.principlesDescription")}
            </p>
          </div>

          <div className="mt-7 grid gap-3 sm:mt-8 sm:gap-4 md:grid-cols-2">
            {principles.map((principle) => (
              <article
                key={principle.number}
                className="rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:border-purple-200 hover:shadow-[0_12px_28px_rgba(88,28,135,0.06)] sm:p-6"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-purple-50 text-xs font-black text-purple-700">
                    {principle.number}
                  </span>

                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      {t(principle.titleKey)}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                      {t(principle.descriptionKey)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Scientific foundation */}
        <section className="border-t border-slate-200 py-10 sm:py-12">
          <div className="grid items-center gap-6 rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 md:grid-cols-[1fr_auto]">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-purple-50 text-sm font-black text-purple-700">
                  {scientificSources.length}
                </span>

                <p className="text-xs font-black uppercase tracking-[0.14em] text-purple-600 sm:text-sm">
                  {t("why.sourcesEyebrow")}
                </p>
              </div>

              <h2 className="mt-4 text-2xl font-black tracking-[-0.03em] text-slate-950 sm:text-3xl">
                {t("why.sourcesTitle")}
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                {t("why.sourcesDescription")}
              </p>
            </div>

            <button
              type="button"
              onClick={openSources}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-purple-700 px-6 py-3 font-bold text-white transition hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 md:w-auto"
            >
              {t("why.openSources")}

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
                  d="M7 7h10M7 12h10M7 17h6"
                />
              </svg>
            </button>
          </div>

          <div className="mt-4 flex items-start gap-3 px-1">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 11v5m0-8h.01"
              />
            </svg>

            <p className="max-w-4xl text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
              {t("why.disclaimer")}
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="rounded-3xl bg-purple-950 px-6 py-7 text-white sm:grid sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8 sm:px-10 sm:py-10 lg:px-12">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
              {t("why.ctaTitle")}
            </h2>

            <p className="mt-3 text-sm leading-6 text-purple-100 sm:text-base sm:leading-7">
              {t("why.ctaDescription")}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/auth")}
            className="hidden min-h-12 items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 font-bold text-purple-900 transition hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-950 sm:inline-flex"
          >
            {t("why.ctaButton")}

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
        </section>
      </div>

      {/* Small-screen fixed CTA */}
      {!showSources && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur-md sm:hidden">
          <button
            type="button"
            onClick={() => navigate("/auth")}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-purple-700 px-6 font-bold text-white transition active:scale-[0.99] active:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            {t("why.ctaButton")}

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
        </div>
      )}

      {/* Scientific sources dialog */}
      {showSources && (
        <div
          className="fixed inset-0 z-[100] flex items-end bg-slate-950/45 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="scientific-sources-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeSources();
            }
          }}
        >
          <div className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_-20px_60px_rgba(15,23,42,0.2)] sm:max-h-[85vh] sm:max-w-4xl sm:rounded-3xl sm:border sm:border-slate-200 sm:shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
            <div className="flex justify-center pb-1 pt-3 sm:hidden">
              <span className="h-1.5 w-12 rounded-full bg-slate-300" />
            </div>

            <header className="flex flex-shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-5 pb-5 pt-3 sm:px-7 sm:py-5">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-purple-50 text-sm font-black text-purple-700">
                    {scientificSources.length}
                  </span>

                  <p className="truncate text-xs font-black uppercase tracking-[0.14em] text-purple-600">
                    {t("why.sourcesEyebrow")}
                  </p>
                </div>

                <h2
                  id="scientific-sources-title"
                  className="mt-3 text-xl font-black text-slate-950 sm:text-2xl"
                >
                  {t("why.sourcesDialogTitle")}
                </h2>

                <p className="mt-1 hidden text-sm text-slate-500 sm:block">
                  {t("why.sourcesDialogDescription")}
                </p>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeSources}
                className="flex h-10 min-w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                aria-label={t("why.closeSources")}
              >
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
                    d="M6 6l12 12M18 6 6 18"
                  />
                </svg>
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 sm:px-7">
              <ol className="divide-y divide-slate-200">
                {scientificSources.map((source, index) => (
                  <li
                    key={source.id}
                    className="grid gap-3 py-5 sm:grid-cols-[40px_1fr_auto] sm:items-start sm:gap-4"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-xs font-black text-purple-700">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <p className="text-sm leading-6 text-slate-600">
                      {source.reference}
                    </p>

                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-10 w-fit items-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-bold text-purple-700 transition hover:border-purple-300 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
                    >
                      {t("why.viewSource")}

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
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4"
                        />
                      </svg>
                    </a>
                  </li>
                ))}
              </ol>
            </div>

            <footer className="flex flex-shrink-0 items-center justify-between gap-4 border-t border-slate-200 bg-white px-5 py-4 sm:px-7">
              <p className="hidden text-sm text-slate-500 sm:block">
                {t("why.sourcesCount", {
                  count: scientificSources.length,
                })}
              </p>

              <button
                type="button"
                onClick={closeSources}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 sm:ml-auto sm:w-auto"
              >
                {t("why.done")}
              </button>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
}