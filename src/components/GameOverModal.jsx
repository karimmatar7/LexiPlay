import React from "react";
import { useTranslation } from "react-i18next";

export default function GameOverModal({ gameOverReason, currentIndex, totalWords, mistakes, maxMistakes, onRestart, onHome }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-md w-full text-center border-4 border-red-200">
        <div className="text-6xl md:text-7xl mb-4 animate-bounce">
          {gameOverReason === 'time' ? '⏰' : '❌'}
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-red-600 mb-4">
          {gameOverReason === 'time' ? t("gameOverModal.timeUp") : t("gameOverModal.tooManyMistakes")}
        </h2>
        <p className="text-lg md:text-xl text-gray-600 mb-2">
          {t("gameOverModal.wordsCompleted", { currentIndex, totalWords })}
        </p>
        <p className="text-base md:text-lg text-gray-500 mb-6">
          {gameOverReason === 'time' 
            ? t("gameOverModal.mistakesTime", { mistakes, maxMistakes })
            : t("gameOverModal.mistakesExceeded", { maxMistakes })
          }
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRestart}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-base md:text-lg font-bold py-3 px-4 rounded-xl hover:scale-105 transition-transform shadow-lg"
          >
            🔄 {t("gameOverModal.retry")}
          </button>
          <button
            onClick={onHome}
            className="flex-1 bg-gray-200 text-gray-700 text-base md:text-lg font-bold py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors"
          >
            🏠 {t("gameOverModal.home")}
          </button>
        </div>
      </div>
    </div>
  );
}
