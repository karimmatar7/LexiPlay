import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChildStats } from "../utils/parent.js";
import { format, parseISO } from "date-fns";
import { Bar } from "react-chartjs-2";
import { useTranslation } from "react-i18next";
import { useSettings } from "../context/SettingsContext"; 

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ParentDashboard() {
  const { t } = useTranslation();
    const { fontType, fontSize } = useSettings();
  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans";
  const sizeMap = { small: "text-base", medium: "text-lg", large: "text-xl" };
  const [stats, setStats] = useState(null);
  const { childId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    getChildStats(childId).then(setStats);
  }, [childId]);

  if (!stats)
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">{t("parentDashboard.loading")}</p>
        </div>
      </div>
    );

  const dailyPlay = stats.playtimeHistory || {};
  const dates = Object.keys(dailyPlay).sort();
  const minutes = dates.map((d) => dailyPlay[d]);
  const totalLevels = Object.values(stats.progress || {}).reduce((sum, g) => sum + (g.level || 0), 0);

const statCards = [
  {
    title: t("parentDashboard.totalPlaytime"),
    icon: "⏱️",
    value: `${stats.totalPlaytime} min`,
    gradient: "from-indigo-400 to-indigo-500",
    border: "border-indigo-200",
    progress: Math.min((stats.totalPlaytime / 1000) * 100, 100),
  },
  {
    title: t("parentDashboard.rewards"),
    icon: "⭐",
    value: `${stats.rewards} ⭐`,
    gradient: "from-amber-400 to-orange-500",
    border: "border-amber-200",
    note:
      stats.rewards > 50
        ? t("parentDashboard.notes.greatJob")
        : t("parentDashboard.notes.keepPracticing"),
    color: "text-amber-600",
  },
  {
    title: t("parentDashboard.levelsCompleted"),
    icon: "🎯",
    value: `${totalLevels} levels`,
    gradient: "from-green-400 to-emerald-500",
    border: "border-green-200",
    progress: Math.min((totalLevels / 20) * 100, 100),
    extra: (
      <span className="text-xs md:text-sm text-gray-600 font-semibold">
        {Math.min(Math.round((totalLevels / 20) * 100), 100)}%
      </span>
    ),
  },
];


<<<<<<< HEAD
  return (
      <div className={`min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 ${fontClass} ${sizeMap[fontSize]}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b-2 border-purple-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
       <button
  onClick={() => navigate(-1)}
  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 border-2 border-gray-300"
>
  <span>{t("parentDashboard.back")}</span>
</button>
=======
return (
  <div className="min-h-screen bg-sky-50 p-6 md:p-8 relative">
>>>>>>> 788629e (several updates and new features)

    {/* Floating pastel shapes */}
    <div className="absolute top-10 left-10 w-40 h-40 bg-pink-200 rounded-full opacity-25 animate-pulse" />
    <div className="absolute bottom-16 right-16 w-48 h-48 bg-yellow-200 rounded-full opacity-20 animate-pulse" />

    <div className="relative max-w-6xl mx-auto space-y-8">

      {/* HEADER */}
      <div className="bg-white rounded-3xl shadow-lg border-2 border-purple-200 p-6 flex justify-between items-center">

        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold rounded-xl border-2 border-purple-300 transition-all duration-200 hover:scale-105"
        >
          ← {t("parentDashboard.back")}
        </button>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#7E22CE] text-white rounded-full flex items-center justify-center text-2xl shadow-md">
            👤
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              {stats.name}
            </h1>
            <p className="text-sm text-purple-700 font-medium">
              {t("parentDashboard.dashboardSubtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {statCards.map((c, i) => (
          <div
            key={i}
            className="bg-white rounded-3xl shadow-md border-2 border-purple-200 p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">{c.icon}</span>
              <span className="text-sm font-semibold text-purple-700">
                {c.title}
              </span>
            </div>

            <p className="text-3xl font-black text-[#7E22CE]">
              {c.value}
            </p>

            {c.progress !== undefined && (
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#7E22CE] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${c.progress}%` }}
                  />
                </div>
                {c.extra}
              </div>
            )}

            {c.note && (
              <p className="text-sm text-gray-600">
                {c.note}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* CHART */}
      <div className="bg-white rounded-3xl shadow-lg border-2 border-purple-200 p-6 md:p-8">

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              📊 {t("parentDashboard.dailyPlaytime")}
            </h2>
            <p className="text-sm text-gray-600">
              {t("parentDashboard.dailyPlaytimeDesc")}
            </p>
          </div>

          <div className="bg-purple-100 px-4 py-2 rounded-xl border border-purple-300">
            <p className="text-sm font-semibold text-purple-700">
              {t("parentDashboard.daysTracked", { count: dates.length })}
            </p>
          </div>
        </div>

        {dates.length > 0 ? (
          <div className="relative h-80">
            <Bar
              key={dates.join(",")}
              data={{
                labels: dates.map((d) => format(parseISO(d), "dd/MM")),
                datasets: [
                  {
                    label: t("parentDashboard.dailyPlaytime"),
                    data: minutes,
                    backgroundColor: "rgba(126,34,206,0.8)", // #7E22CE
                    borderColor: "rgba(109,40,217,1)",
                    borderWidth: 2,
                    borderRadius: 8,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: "rgba(0,0,0,0.05)" },
                    ticks: { callback: (v) => `${v} min` },
                  },
                  x: { grid: { display: false } },
                },
              }}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="text-5xl block mb-3">📭</span>
            <p className="text-gray-600 font-semibold">
              {t("parentDashboard.noPlaytime")}
            </p>
          </div>
        )}
      </div>

      {/* GAME PROGRESS */}
      <div className="bg-white rounded-3xl shadow-lg border-2 border-purple-200 p-6 md:p-8">

        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          🎮 {t("parentDashboard.gameProgress")}
        </h2>

        {Object.keys(stats.progress || {}).length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {Object.entries(stats.progress).map(([game, data]) => (
              <div
                key={game}
                className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-200 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-800 capitalize">
                    {t(`gameCards.${game}.title`)}
                  </h3>
                  <span className="text-xl">
                    {data.level >= 5 ? "🏆" : data.level >= 3 ? "🥈" : "🥉"}
                  </span>
                </div>

                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>{t("parentDashboard.level")}:</span>
                    <span className="font-bold text-[#7E22CE]">
                      {data.level || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("parentDashboard.score")}:</span>
                    <span className="font-bold text-[#7E22CE]">
                      {data.score || 0}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1 pt-2">
                  {(data.rewardsEarned || [false, false, false]).map(
                    (earned, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          earned ? "opacity-100" : "opacity-20"
                        }`}
                      >
                        ⭐
                      </span>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <span className="text-4xl block mb-3">🎯</span>
            <p className="text-gray-600 font-semibold">
              {t("parentDashboard.noProgress")}
            </p>
          </div>
        )}
      </div>

    </div>
  </div>
);


}
