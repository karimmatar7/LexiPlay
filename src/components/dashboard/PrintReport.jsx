import React from "react";
import { format, parseISO } from "date-fns";
import { useTranslation } from "react-i18next";
import { heartStatus } from "../../utils/heartStatus.js";

const KNOWN_GAMES = ["letterBuild", "wordMaze", "wordMatch", "finalWordBuilder"];

export default function PrintReport({ stats, derived }) {
  const { t } = useTranslation();
  const { progress, dates, minutes, totalPlaytime, streak, lastActive, avgPerDay, xp, xpLevel, keys } = derived;
  const today = format(new Date(), "dd MMMM yyyy");

  return (
    <div id="print-report" className="font-sans text-gray-800 p-8 max-w-3xl mx-auto">

      {/* Header */}
      <div className="border-b-2 border-purple-400 pb-4 mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-purple-800">{t("print.title")}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{t("print.generated")}: {today}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-800">{stats.name}</p>
          {lastActive && (
            <p className="text-xs text-gray-400">
              {t("parentDashboard.lastSeen")}: {format(parseISO(lastActive), "dd MMM yyyy")}
            </p>
          )}
        </div>
      </div>

      {/* Player Overview */}
      <div className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-purple-600 mb-2">
          {t("print.playerOverview")}
        </h2>
        <div className="grid grid-cols-4 gap-3 border border-gray-200 rounded-xl p-4">
          {[
            { label: t("parentDashboard.xpLevel"), value: xpLevel },
            { label: t("print.totalXP"),           value: `${xp} XP` },
            { label: t("parentDashboard.keys"),     value: keys },
            { label: t("parentDashboard.streak"),   value: `${streak} 🔥` },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <p className="text-xs text-gray-400 font-medium">{item.label}</p>
              <p className="text-xl font-black text-purple-700">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Playtime Summary */}
      <div className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-purple-600 mb-2">
          {t("print.playtimeSummary")}
        </h2>
        <div className="border border-gray-200 rounded-xl p-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-400 font-medium">{t("parentDashboard.totalPlaytime")}</p>
            <p className="text-xl font-black text-purple-700">{Math.round(totalPlaytime)} min</p>
            <p className="text-xs text-gray-400">≈ {(totalPlaytime / 60).toFixed(1)}h</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">{t("parentDashboard.dailyAvg")}</p>
            <p className="text-xl font-black text-purple-700">{avgPerDay} min</p>
            <p className="text-xs text-gray-400">{dates.length} {t("parentDashboard.daysTracked")}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">{t("print.engagement")}</p>
            <p className="text-lg font-black text-purple-700">
              {Number(avgPerDay) >= 15
                ? t("parentDashboard.engagementHigh")
                : Number(avgPerDay) >= 5
                ? t("parentDashboard.engagementMedium")
                : t("parentDashboard.engagementLow")}
            </p>
          </div>
        </div>
      </div>

      {/* Daily History Table */}
      {dates.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-purple-600 mb-2">
            {t("print.dailyHistory")}
          </h2>
          <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
            <thead className="bg-purple-50">
              <tr>
                <th className="text-left px-3 py-2 font-semibold text-gray-600">{t("print.date")}</th>
                <th className="text-right px-3 py-2 font-semibold text-gray-600">{t("print.minutesPlayed")}</th>
              </tr>
            </thead>
            <tbody>
              {dates.map((d, i) => (
                <tr key={d} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-3 py-1.5 text-gray-700">{format(parseISO(d), "dd MMM yyyy")}</td>
                  <td className="px-3 py-1.5 text-right font-medium text-purple-700">{minutes[i]} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Game Progress Table */}
      <div className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-purple-600 mb-2">
          {t("parentDashboard.gameProgress")}
        </h2>
        <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
          <thead className="bg-purple-50">
            <tr>
              <th className="text-left px-3 py-2 font-semibold text-gray-600">{t("print.game")}</th>
              <th className="text-center px-3 py-2 font-semibold text-gray-600">{t("parentDashboard.level")}</th>
              <th className="text-center px-3 py-2 font-semibold text-gray-600">{t("parentDashboard.wordNumber")}</th>
              <th className="text-center px-3 py-2 font-semibold text-gray-600">{t("parentDashboard.hearts")}</th>
              <th className="text-center px-3 py-2 font-semibold text-gray-600">{t("print.status")}</th>
            </tr>
          </thead>
          <tbody>
            {KNOWN_GAMES.filter((k) => progress[k]).map((k, i) => {
              const data = progress[k];
              const hs   = heartStatus(data);
              return (
                <tr key={k} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-3 py-2 font-medium text-gray-800">{t(`gameCards.${k}.title`)}</td>
                  <td className="px-3 py-2 text-center text-purple-700 font-bold">{data?.level ?? 0}</td>
                  <td className="px-3 py-2 text-center text-purple-700 font-bold">{(data?.levelIndex ?? 0) + 1}</td>
                  <td className="px-3 py-2 text-center">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <span key={j} style={{ opacity: j < (hs?.hearts ?? 5) ? 1 : 0.2 }}>❤️</span>
                    ))}
                  </td>
                  <td className="px-3 py-2 text-center text-xs font-semibold">
                    {hs?.isRefilling
                      ? <span className="text-rose-500">⏳ {t("parentDashboard.refilling")}</span>
                      : hs?.outOfHearts
                      ? <span className="text-rose-500">💔 {t("parentDashboard.outOfHearts")}</span>
                      : <span className="text-emerald-600">✅ {t("parentDashboard.heartsReady")}</span>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 pt-4 text-xs text-gray-400 flex justify-between">
        <span>{t("print.footer")}</span>
        <span>{today}</span>
      </div>
    </div>
  );
}
