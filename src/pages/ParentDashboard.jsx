import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChildStats } from "../utils/parent.js";
import { format, parseISO, differenceInDays } from "date-fns";
import { useTranslation } from "react-i18next";
import { useSettings } from "../context/SettingsContext";
import { heartStatus } from "../utils/heartStatus.js";
import GameCard from "../components/dashboard/GameCard";
import StatCards from "../components/dashboard/StatCards";
import PlaytimeChart from "../components/dashboard/PlaytimeChart";
import SessionSummary from "../components/dashboard/SessionSummary";
import PrintButton from "../components/dashboard/PrintButton";
import PrintReport from "../components/dashboard/PrintReport";

const KNOWN_GAMES = ["wordMatch", "letterBuild", "wordMaze", "finalWordBuilder", "letterDraw"];

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

    const refilling   = Object.entries(progress).filter(([, g]) => heartStatus(g)?.isRefilling);
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

  const statCards = [
    { label: t("parentDashboard.totalPlaytime"), value: `${Math.round(totalPlaytime)} min`, sub: `≈ ${(totalPlaytime / 60).toFixed(1)}h`, color: "bg-indigo-50 border-indigo-200" },
    { label: t("parentDashboard.dailyAvg"),      value: `${avgPerDay} min`, sub: `${dates.length} ${t("parentDashboard.daysTracked")}`,   color: "bg-sky-50 border-sky-200"     },
    { label: t("parentDashboard.streak"),         value: `${streak} 🔥`,    sub: streak >= 3 ? t("parentDashboard.streakGreat") : t("parentDashboard.streakKeepGoing"), color: "bg-amber-50 border-amber-200" },
    { label: t("parentDashboard.keys"),           value: `🗝️ ${keys}`,                                                                   color: "bg-yellow-50 border-yellow-200" },
  ];

  return (
    <div className={`min-h-screen bg-sky-50 p-3 sm:p-6 md:p-8 ${fontClass}`}>

      <div className="hidden sm:block fixed top-0 left-0 w-72 h-72 bg-purple-100 rounded-full opacity-30 blur-3xl pointer-events-none -z-10" />
      <div className="hidden sm:block fixed bottom-0 right-0 w-96 h-96 bg-sky-100 rounded-full opacity-30 blur-3xl pointer-events-none -z-10" />

      <div className="relative max-w-4xl mx-auto space-y-4 sm:space-y-6">

        {/* HEADER */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border-2 border-purple-200 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold rounded-xl border-2 border-purple-300 transition-all hover:scale-105 text-xs sm:text-sm shrink-0"
            >
              {t("parentDashboard.back")}
            </button>

                      <PrintButton />
          
            <div className="flex items-center gap-3 flex-1 min-w-0 justify-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#7E22CE] text-white rounded-full flex items-center justify-center text-lg sm:text-xl shadow-md shrink-0">👤</div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-gray-800 truncate">{stats.name}</h1>
                <p className="text-xs text-purple-600 font-medium truncate">
                  {lastActive
                    ? `${t("parentDashboard.lastSeen")}: ${format(parseISO(lastActive), "dd MMM yyyy")}`
                    : t("parentDashboard.neverPlayed")}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center bg-purple-50 rounded-2xl px-3 py-2 sm:px-4 border-2 border-purple-200 min-w-[70px] sm:min-w-[80px] text-center shrink-0">
              <span className="text-xs text-purple-500 font-semibold">{t("parentDashboard.xpLevel")}</span>
              <span className="text-xl sm:text-2xl font-black text-[#7E22CE] leading-tight">{xpLevel}</span>
              <span className="text-xs text-gray-400">{xp} XP</span>
            </div>
          </div>


{/* Hidden on screen, visible only when printing */}
<div className="print-only">
  <PrintReport stats={stats} derived={derived} />
</div>
        </div>

        {/* HEARTS ALERT */}
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

        <StatCards cards={statCards} />

        <PlaytimeChart dates={dates} minutes={minutes} avgPerDay={avgPerDay} t={t} />

        {/* GAME CARDS */}
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

        <SessionSummary
          dates={dates}
          totalPlaytime={totalPlaytime}
          avgPerDay={avgPerDay}
          lastActive={lastActive}
          readyToPlay={readyToPlay}
          refilling={refilling}
          t={t}
        />

      </div>
    </div>
  );
}
