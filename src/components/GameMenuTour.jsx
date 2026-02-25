// src/components/GameMenuTour.jsx
import React from "react";

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute inset-0" onClick={onSkip} aria-hidden="true" />

      <div
        className={`relative z-10 max-w-lg w-[90%] sm:w-[420px] bg-white rounded-3xl border-4 border-indigo-300 shadow-2xl p-6 sm:p-7 ${fontClass}`}
      >
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
            {stepIndex + 1} / {steps.length}
          </span>
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-gray-800 mb-2 flex items-center gap-2">
          <span className="text-2xl">{step.icon}</span>
          <span>{step.title}</span>
        </h2>

        <p className="text-sm sm:text-base text-gray-600 mb-4">
          {step.description}
        </p>

        {step.hint && (
          <p className="text-xs text-indigo-500 font-semibold mb-4">
            {step.hint}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 mt-2">
          <button
            onClick={onPrev}
            disabled={stepIndex === 0}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border-2 transition
              ${
                stepIndex === 0
                  ? "border-gray-200 text-gray-300 cursor-default"
                  : "border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
          >
            ← {stepIndex === 0 ? "" : "Prev"}
          </button>

          <div className="flex gap-2">
            <button
              onClick={onSkip}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border-2 border-gray-200 text-gray-500 hover:bg-gray-50"
            >
              {step.skipLabel}
            </button>

            <button
              onClick={isLast ? onFinish : onNext}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-500 hover:bg-indigo-600 text-white shadow-md border-b-4 border-indigo-700 transform hover:scale-105 transition"
            >
              {isLast ? step.finishLabel : step.nextLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
