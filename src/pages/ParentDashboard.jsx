import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChildStats } from "../utils/parent.js";
import { format, parseISO, differenceInDays, formatDistanceToNow } from "date-fns";
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

const KNOWN_GAMES = ["letterBuild", "wordMaze", "wordMatch", "finalWordBuilder"];
const MAX_HEARTS  = 5;

const GAME_META = {
  letterBuild:      { emoji: "🔤", border: "border-indigo-200", bg: "bg-indigo-50"  },
  wordMaze:         { emoji: "🌀", border: "border-sky-200",    bg: "bg-sky-50"     },
  wordMatch:        { emoji: "🃏", border: "border-pink-200",   bg: "bg-pink-50"    },
  finalWordBuilder: { emoji: "🏗️", border: "border-amber-200", bg: "bg-amber-50"   },
};

const MINUTES_PER_HEART = 12;
const MS_PER_HEART      = MINUTES_PER_HEART * 60 * 1000;

function heartStatus(gameData) {
  if (!gameData) return null;
  const hearts         = gameData.hearts ?? MAX_HEARTS;
  const cooldown       = gameData.cooldownUntil ?? null;
  const cooldownActive = cooldown && new Date(cooldown) > new Date();
  const isRefilling    = cooldownActive && hearts < MAX_HEARTS;
  const outOfHearts    = hearts === 0 && !cooldownActive;

  // Time until ALL missing hearts are back
  // cooldown = when next heart finishes, so stack (missing - 1) more intervals
  let fullRefillAt = null;
  if (isRefilling && cooldown) {
    const heartsNeeded = MAX_HEARTS - hearts;
    fullRefillAt = new Date(new Date(cooldown).getTime() + (heartsNeeded - 1) * MS_PER_HEART);
  }

  return { hearts, isRefilling, outOfHearts, cooldown, fullRefillAt };
}

function calcStreak(history) {
  const dates = Object.keys(history || {}).sort().reverse();
  if (!dates.length) return 0;
  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (const d of dates) {
    const day = parseISO(d);
    day.setHours(0, 0, 0, 0);
    if (differenceInDays(cursor, day) <= 1) { streak++; cursor = day; }
    else break;
  }
  return streak;
}

function HeartsRow({ count = 5, max = MAX_HEARTS }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`text-base ${i < count ? "opacity-100" : "opacity-15"}`}>❤️</span>
      ))}
    </div>
  );
}

function GameCard({ gameKey, data, t }) {
  const meta = GAME_META[gameKey] || { emoji: "🎮", border: "border-gray-200", bg: "bg-gray-50" };
  const hs   = heartStatus(data);

  return (
    <div className={`rounded-2xl border-2 ${meta.border} ${meta.bg} p-4 sm:p-5 flex flex-col gap-3`}>

      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">{meta.emoji}</span>
        <h3 className="font-bold text-gray-800 text-sm sm:text-base leading-tight">
          {t(`gameCards.${gameKey}.title`)}
        </h3>
      </div>

      {/* Level + Word index */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-medium mb-1">{t("parentDashboard.level")}</p>
          <p className="text-xl font-black text-[#7E22CE]">{data?.level ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-medium mb-1">{t("parentDashboard.wordNumber")}</p>
          <p className="text-xl font-black text-[#7E22CE]">{(data?.levelIndex ?? 0) + 1}</p>
        </div>
      </div>

      {/* Hearts */}
      {hs && (
        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 font-medium">{t("parentDashboard.hearts")}</span>
            <HeartsRow count={hs.hearts} max={MAX_HEARTS} />
          </div>
          {hs.isRefilling ? (
  <p className="text-xs text-rose-500 font-medium">
    ⏳ {t("parentDashboard.refilling")} · {formatDistanceToNow(hs.fullRefillAt, { addSuffix: true })}
  </p>
) : hs.outOfHearts ? (
  <p className="text-xs text-rose-500 font-medium">
    💔 {t("parentDashboard.outOfHearts")}
  </p>
) : (
  <p className="text-xs text-emerald-600 font-medium">
    ✅ {t("parentDashboard.heartsReady")}
  </p>
)}

        </div>
      )}
    </div>
  );
}

export default function ParentDashboard() {
  const { t } = useTranslation();
  const { fontType } = useSettings();
  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans";

  const [stats, setStats] = useState(null);
  const { childId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    getChildStats(childId).then(setStats);
  }, [childId]);

  const derived = useMemo(() => {
    if (!stats) return null;

    const rawProgress = stats.progress || {};

    const xp      = rawProgress.xp             || 0;
    const xpLevel = rawProgress.level          || 1;
    const keys    = rawProgress.currency?.keys || 0;

    const progress = Object.fromEntries(
      Object.entries(rawProgress).filter(([k]) => KNOWN_GAMES.includes(k))
    );

    const history       = stats.playtimeHistory || {};
    const dates         = Object.keys(history).sort();
    const minutes       = dates.map((d) => history[d]);
    const totalPlaytime = stats.totalPlaytime || 0;
    const streak        = calcStreak(history);
    const lastActive    = dates.length ? dates[dates.length - 1] : null;
    const avgPerDay     = dates.length ? (totalPlaytime / dates.length).toFixed(1) : 0;

    const refilling = Object.entries(progress).filter(([, g]) => heartStatus(g)?.isRefilling);
    const readyToPlay = Object.entries(progress).filter(([, g]) => {
      const hs = heartStatus(g);
      return g?.unlocked && hs?.hearts > 0 && !hs?.isRefilling;
    });

    return { progress, dates, minutes, totalPlaytime, streak, lastActive, avgPerDay, refilling, readyToPlay, xp, xpLevel, keys };
  }, [stats]);

  if (!stats || !derived)
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-14 w-14 border-4 border-indigo-500 border-t-transparent" />
          <p className="text-lg font-semibold text-gray-600">{t("parentDashboard.loading")}</p>
        </div>
      </div>
    );

  const { progress, dates, minutes, totalPlaytime, streak, lastActive, avgPerDay, refilling, readyToPlay, xp, xpLevel, keys } = derived;

  return (
    <div className={`min-h-screen bg-sky-50 p-3 sm:p-6 md:p-8 ${fontClass}`}>

      {/* Decorative blobs — hidden on very small screens to avoid layout issues */}
      <div className="hidden sm:block fixed top-0 left-0 w-72 h-72 bg-purple-100 rounded-full opacity-30 blur-3xl pointer-events-none -z-10" />
      <div className="hidden sm:block fixed bottom-0 right-0 w-96 h-96 bg-sky-100 rounded-full opacity-30 blur-3xl pointer-events-none -z-10" />

      <div className="relative max-w-4xl mx-auto space-y-4 sm:space-y-6">

        {/* ── HEADER ── */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border-2 border-purple-200 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">

            <button
              onClick={() => navigate(-1)}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold rounded-xl border-2 border-purple-300 transition-all hover:scale-105 text-xs sm:text-sm shrink-0"
            >
              ← {t("parentDashboard.back")}
            </button>

            {/* Name + last seen */}
            <div className="flex items-center gap-3 flex-1 min-w-0 justify-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#7E22CE] text-white rounded-full flex items-center justify-center text-lg sm:text-xl shadow-md shrink-0">
                👤
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-gray-800 truncate">{stats.name}</h1>
                <p className="text-xs text-purple-600 font-medium truncate">
                  {lastActive
                    ? `${t("parentDashboard.lastSeen")}: ${format(parseISO(lastActive), "dd MMM yyyy")}`
                    : t("parentDashboard.neverPlayed")}
                </p>
              </div>
            </div>

            {/* XP badge */}
            <div className="flex flex-col items-center bg-purple-50 rounded-2xl px-3 py-2 sm:px-4 border-2 border-purple-200 min-w-[70px] sm:min-w-[80px] text-center shrink-0">
              <span className="text-xs text-purple-500 font-semibold">{t("parentDashboard.xpLevel")}</span>
              <span className="text-xl sm:text-2xl font-black text-[#7E22CE] leading-tight">{xpLevel}</span>
              <span className="text-xs text-gray-400">{xp} XP</span>
            </div>
          </div>
        </div>

        {/* ── HEARTS REFILLING ALERT ── */}
        {refilling.length > 0 && (
          <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-3 sm:p-4 flex items-start gap-3">
            <span className="text-xl sm:text-2xl shrink-0">⚠️</span>
            <div>
              <p className="font-bold text-rose-700 text-sm">{t("parentDashboard.heartsRefillingTitle")}</p>
              <p className="text-rose-600 text-xs mt-0.5">
                {refilling.map(([k]) => t(`gameCards.${k}.title`)).join(", ")}
                {" — "}{t("parentDashboard.heartsRefillingDesc")}
              </p>
            </div>
          </div>
        )}

        {/* ── STAT CARDS + KEYS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              label: t("parentDashboard.totalPlaytime"),
              value: `${Math.round(totalPlaytime)} min`,
              sub:   `≈ ${(totalPlaytime / 60).toFixed(1)}h`,
              color: "bg-indigo-50 border-indigo-200",
            },
            {
              label: t("parentDashboard.dailyAvg"),
              value: `${avgPerDay} min`,
              sub:   `${dates.length} ${t("parentDashboard.daysTracked")}`,
              color: "bg-sky-50 border-sky-200",
            },
            {
              label: t("parentDashboard.streak"),
              value: `${streak} 🔥`,
              sub:   streak >= 3 ? t("parentDashboard.streakGreat") : t("parentDashboard.streakKeepGoing"),
              color: "bg-amber-50 border-amber-200",
            },
            {
              label: t("parentDashboard.keys"),
              value: `🗝️ ${keys}`,
              color: "bg-yellow-50 border-yellow-200",
            },
          ].map((card, i) => (
            <div key={i} className={`rounded-2xl border-2 ${card.color} p-3 sm:p-4 space-y-1`}>
              <p className="text-xs font-semibold text-gray-500 leading-tight">{card.label}</p>
              <p className="text-xl sm:text-2xl font-black text-[#7E22CE] leading-tight">{card.value}</p>
              <p className="text-xs text-gray-400 leading-tight">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* ── PLAYTIME CHART ── */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border-2 border-purple-200 p-4 sm:p-6">
          <div className="flex justify-between items-start mb-4 sm:mb-5 flex-wrap gap-2 sm:gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800">
                📊 {t("parentDashboard.dailyPlaytime")}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">{t("parentDashboard.dailyPlaytimeDesc")}</p>
            </div>
            <div className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold ${
              Number(avgPerDay) >= 15 ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : Number(avgPerDay) >= 5 ? "bg-amber-50 border-amber-200 text-amber-700"
              : "bg-rose-50 border-rose-200 text-rose-700"
            }`}>
              {Number(avgPerDay) >= 15 ? t("parentDashboard.engagementHigh")
                : Number(avgPerDay) >= 5 ? t("parentDashboard.engagementMedium")
                : t("parentDashboard.engagementLow")}
            </div>
          </div>

          {dates.length > 0 ? (
            <div className="relative h-52 sm:h-64">
              <Bar
                key={dates.join(",")}
                data={{
                  labels: dates.map((d) => format(parseISO(d), "dd/MM")),
                  datasets: [{
                    label: t("parentDashboard.minutes"),
                    data: minutes,
                    backgroundColor: "rgba(126,34,206,0.75)",
                    borderColor:     "rgba(109,40,217,1)",
                    borderWidth: 2,
                    borderRadius: 8,
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: "rgba(0,0,0,0.05)" },
                      ticks: { callback: (v) => `${v}m`, font: { size: 11 } },
                    },
                    x: {
                      grid: { display: false },
                      ticks: { font: { size: 11 } },
                    },
                  },
                }}
              />
            </div>
          ) : (
            <div className="text-center py-10">
              <span className="text-4xl block mb-2">📭</span>
              <p className="text-gray-500 text-sm font-semibold">{t("parentDashboard.noPlaytime")}</p>
            </div>
          )}
        </div>

        {/* ── GAME CARDS ── */}
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            🎮 {t("parentDashboard.gameProgress")}
          </h2>
          {Object.keys(progress).length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {KNOWN_GAMES.filter((k) => progress[k]).map((gameKey) => (
                <GameCard key={gameKey} gameKey={gameKey} data={progress[gameKey]} t={t} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-purple-200 p-8 sm:p-10 text-center">
              <span className="text-4xl block mb-3">🎯</span>
              <p className="text-gray-500 font-semibold text-sm">{t("parentDashboard.noProgress")}</p>
            </div>
          )}
        </div>

        {/* ── SESSION SUMMARY ── */}
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

      </div>
    </div>
  );
}
