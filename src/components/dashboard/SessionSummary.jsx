import React from "react";
import { format, parseISO } from "date-fns";

export default function SessionSummary({ dates, totalPlaytime, avgPerDay, lastActive, readyToPlay, refilling, t }) {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-purple-200 shadow-sm p-4 sm:p-6 space-y-3">
      <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
        🩺 {t("parentDashboard.sessionSummary")}
      </h2>
      <ul className="text-sm text-gray-700 space-y-2">
        <li className="flex items-start gap-2">
          <span className="shrink-0">📆</span>
          <span>
            <strong>{t("parentDashboard.activeDays")}:</strong>{" "}
            {t("parentDashboard.activeDaysValue", { count: dates.length })}
            {lastActive ? ` · ${t("parentDashboard.mostRecent")}: ${format(parseISO(lastActive), "dd MMM yyyy")}` : ""}
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="shrink-0">⏱️</span>
          <span>
            <strong>{t("parentDashboard.totalTime")}:</strong>{" "}
            {Math.round(totalPlaytime)} min · {t("parentDashboard.avg")} {avgPerDay} min/{t("parentDashboard.day")}
          </span>
        </li>
        {readyToPlay.length > 0 && (
          <li className="flex items-start gap-2 text-emerald-700">
            <span className="shrink-0">✅</span>
            <span>
              <strong>{t("parentDashboard.readyToPlay")}:</strong>{" "}
              {readyToPlay.map(([k]) => t(`gameCards.${k}.title`)).join(", ")}
            </span>
          </li>
        )}
        {refilling.length > 0 && (
          <li className="flex items-start gap-2 text-rose-600">
            <span className="shrink-0">⏳</span>
            <span>
              <strong>{t("parentDashboard.waitingGames")}:</strong>{" "}
              {refilling.map(([k]) => t(`gameCards.${k}.title`)).join(", ")}
            </span>
          </li>
        )}
      </ul>
    </div>
  );
}
