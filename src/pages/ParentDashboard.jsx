import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChildStats } from "../utils/parent.js";
import { format, parseISO } from "date-fns";
import { Bar } from "react-chartjs-2";
import { useTranslation } from "react-i18next";

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


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b-2 border-purple-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
       <button
  onClick={() => navigate(-1)}
  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 border-2 border-gray-300"
>
  <span>{t("parentDashboard.back")}</span>
</button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-2xl shadow-md">👤</div>
            <div className="hidden sm:block">
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">{stats.name}</h1>
              <p className="text-sm text-gray-600">{t("parentDashboard.dashboardSubtitle")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {statCards.map((c, i) => (
            <div
              key={i}
              className={`bg-white rounded-2xl md:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 ${c.border} overflow-hidden ${
                i === 2 ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div className={`bg-gradient-to-br ${c.gradient} p-4 md:p-6`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl md:text-4xl">{c.icon}</span>
                  <div className="bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-white text-xs md:text-sm font-semibold">
                      {c.title.includes("Rewards") ? t("parentDashboard.rewards") : i === 2 ? t("parentDashboard.levelsCompleted") : t("parentDashboard.totalPlaytime")}
                    </span>
                  </div>
                </div>
                <h2 className="text-white text-base md:text-lg font-semibold mb-1">{c.title}</h2>
              </div>
              <div className="p-4 md:p-6">
                <p className={`text-3xl md:text-4xl font-black ${c.color} mb-2`}>{c.value}</p>
                {c.progress && (
                  <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all duration-500 ${c.color}`} style={{ width: `${c.progress}%` }} />
                    </div>
                    {c.extra}
                  </div>
                )}
                {c.note && <p className="text-xs md:text-sm text-gray-600">{c.note}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg p-4 md:p-8 border-2 border-purple-200 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-3">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1 md:mb-2">
                📊 {t("parentDashboard.dailyPlaytime")}
              </h2>
              <p className="text-sm md:text-base text-gray-600">{t("parentDashboard.dailyPlaytimeDesc")}</p>
            </div>
            <div className="bg-purple-100 px-3 md:px-4 py-2 rounded-xl border border-purple-300">
              <p className="text-xs md:text-sm font-semibold text-purple-700">{t("parentDashboard.daysTracked", { count: dates.length })}</p>
            </div>
          </div>
          {dates.length > 0 ? (
            <div className="relative h-64 sm:h-72 md:h-80 lg:h-96">
              <Bar
                key={dates.join(",")}
                data={{
                  labels: dates.map((d) => format(parseISO(d), "dd/MM")),
                  datasets: [
                    {
                      label: t("parentDashboard.dailyPlaytime"),
                      data: minutes,
                      backgroundColor: "rgba(139, 92, 246, 0.8)",
                      borderColor: "rgba(109, 40, 217, 1)",
                      borderWidth: 2,
                      borderRadius: 8,
                      hoverBackgroundColor: "rgba(109, 40, 217, 0.9)",
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: "rgba(0,0,0,0.8)",
                      padding: 12,
                      titleFont: { size: 14, weight: "bold" },
                      bodyFont: { size: 13 },
                      cornerRadius: 8,
                      callbacks: { label: (ctx) => `${ctx.parsed.y} ${t("parentDashboard.dailyPlaytime")}` },
                    },
                  },
                  scales: {
                    y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" }, ticks: { font: { size: 12 }, callback: (v) => `${v} min` } },
                    x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 45, minRotation: 45 } },
                  },
                }}
              />
            </div>
          ) : (
            <div className="text-center py-12 md:py-16">
              <span className="text-5xl md:text-6xl mb-4 block">📭</span>
              <p className="text-base md:text-lg text-gray-600 font-semibold">{t("parentDashboard.noPlaytime")}</p>
              <p className="text-sm md:text-base text-gray-500 mt-2">{t("parentDashboard.startPlaying", { name: stats.name })}</p>
            </div>
          )}
        </div>

        {/* Game Progress */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg p-4 md:p-8 border-2 border-rose-200">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center gap-3">
            <span className="text-2xl md:text-3xl">🎮</span> {t("parentDashboard.gameProgress")}
          </h2>
          {Object.keys(stats.progress || {}).length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(stats.progress).map(([game, data]) => (
  <div key={game} className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl md:rounded-2xl p-4 md:p-6 border-2 border-pink-200 hover:border-pink-300 transition-all">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-base md:text-lg font-bold text-gray-800 capitalize">
        {t(`gameCards.${game}.title`)}
      </h3>
      <span className="text-xl md:text-2xl">{data.level >= 5 ? "🏆" : data.level >= 3 ? "🥈" : "🥉"}</span>
    </div>
    <div className="space-y-2">
      {["level", "score"].map((k) => (
        <div key={k} className="flex justify-between text-xs md:text-sm">
          <span className="text-gray-600">{t(`parentDashboard.${k}`)}:</span>
          <span className="font-bold text-purple-600">{data[k] || 0}</span>
        </div>
      ))}
      <div className="flex gap-1 mt-2">
        {(data.rewardsEarned || [false, false, false]).map((earned, i) => (
          <span key={i} className={`text-base md:text-lg ${earned ? "opacity-100" : "opacity-20"}`}>⭐</span>
        ))}
      </div>
    </div>
  </div>
))}

            </div>
          ) : (
            <div className="text-center py-8 md:py-12">
              <span className="text-4xl md:text-5xl mb-3 block">🎯</span>
              <p className="text-base md:text-lg text-gray-600 font-semibold">{t("parentDashboard.noProgress")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
