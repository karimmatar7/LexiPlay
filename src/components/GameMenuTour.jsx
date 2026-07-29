// src/components/GameMenuTour.jsx
import React from "react";
import AppButton from "./AppButton";

export default function GameMenuTour({
  open,
  stepIndex,
  steps,
  onNext,
  onPrev,
  onSkip,
  onFinish,
  fontClass,
}) {
  if (!open) return null;
  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;
  const isFirst = stepIndex === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute inset-0" onClick={onSkip} aria-hidden="true" />

      <div
        className={`relative z-10 max-w-lg w-full sm:w-[420px] bg-white rounded-3xl border border-indigo-100 shadow-[0_25px_60px_rgba(15,23,42,0.25)] p-6 sm:p-7 ${fontClass}`}
      >
        {/* Top bar: progress dots + close */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === stepIndex
                    ? "w-6 bg-indigo-500"
                    : i < stepIndex
                    ? "w-1.5 bg-indigo-300"
                    : "w-1.5 bg-gray-200"
                }`}
              />
            ))}
          </div>
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Icon + title */}
        <div className="flex items-center gap-3 mb-3">
          <span className="flex-shrink-0 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center bg-indigo-50 rounded-2xl border border-indigo-100">
            <img
              src={step.icon}
              alt=""
              aria-hidden="true"
              draggable="false"
              className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
            />
          </span>
          <h2 className="text-lg sm:text-2xl font-black text-gray-900 leading-tight">
            {step.title}
          </h2>
        </div>

        <p className="text-sm sm:text-base text-gray-600 mb-4">
          {step.description}
        </p>

        {step.hint && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-2.5 mb-5">
            <p className="text-xs sm:text-sm text-indigo-600 font-semibold">
              {step.hint}
            </p>
          </div>
        )}

        {/* Nav buttons */}
       <div className="flex items-center justify-between gap-2 mt-2">
  <AppButton
    onClick={onPrev}
    disabled={isFirst}
    variant="neutral"
    size="sm"
    className="gap-1.5 px-4 text-xs sm:text-sm"
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 shrink-0"
      aria-hidden="true"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
    <span className="hidden sm:inline">Prev</span>
  </AppButton>

  <div className="flex gap-2">
    <AppButton
      onClick={onSkip}
      variant="neutral"
      size="sm"
      className="px-4 text-xs text-gray-500 sm:text-sm"
    >
      {step.skipLabel}
    </AppButton>

    <AppButton
      onClick={isLast ? onFinish : onNext}
      variant="indigo"
      size="sm"
      className="gap-1.5 px-5 text-xs sm:text-sm"
    >
      <span>{isLast ? step.finishLabel : step.nextLabel}</span>

      {!isLast && (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5 shrink-0"
          aria-hidden="true"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )}
    </AppButton>
  </div>
</div>
      </div>
    </div>
  );
}