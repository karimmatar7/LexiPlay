import React from "react";
import { useTranslation } from "react-i18next";

export default function FeedbackModal({ type }) {
  const { t } = useTranslation();
  if (!type) return null;

  const data = {
    correct: {
      emoji: "🎉",
      title: t("feedbackModal.correct.title"),
      text: t("feedbackModal.correct.text"),
      bgColor: "bg-green-100",
      borderColor: "border-green-400",
      titleColor: "text-green-700",
    },
    incorrect: {
      emoji: "🦊",
      title: t("feedbackModal.incorrect.title"),
      text: t("feedbackModal.incorrect.text"),
      bgColor: "bg-orange-100",
      borderColor: "border-orange-400",
      titleColor: "text-orange-700",
    },
  };

  const { emoji, title, text, bgColor, borderColor, titleColor } = data[type] || {};

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
      <div className={`${bgColor} border-3 ${borderColor} rounded-3xl shadow-xl p-8 sm:p-12 text-center max-w-sm w-full animate-scale-in`}>
        {/* Emoji Container */}
        <div className="inline-block bg-white border-2 border-gray-200 rounded-full p-6 mb-6 shadow-sm">
          <span className="text-7xl">{emoji}</span>
        </div>
        
        {/* Title */}
        <h3 className={`text-3xl sm:text-4xl font-black ${titleColor} mb-4`}>
          {title}
        </h3>
        
        {/* Message */}
        <p className="text-xl sm:text-2xl text-gray-700 font-bold">
          {text}
        </p>
      </div>
    </div>
  );
}
