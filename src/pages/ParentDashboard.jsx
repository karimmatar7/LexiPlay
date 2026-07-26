// src/pages/ParentDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { differenceInDays, format, parseISO } from "date-fns";
import { useTranslation } from "react-i18next";

import { getChildStats } from "../utils/parent.js";
import { heartStatus } from "../utils/heartStatus.js";
import { useSettings } from "../context/SettingsContext";

import GameCard from "../components/dashboard/GameCard";
import PrintButton from "../components/dashboard/PrintButton";
import PrintReport from "../components/dashboard/PrintReport";
import ProgressAssistant from "../components/dashboard/ProgressAssistant";
import StatCards from "../components/dashboard/StatCards";

const KNOWN_GAMES = [
  "wordMatch",
  "letterBuild",
  "wordMaze",
  "finalWordBuilder",
  "letterDraw",
];

function safeNumber(value, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : fallback;
}

function calcStreak(history = {}) {
  const dates = Object.keys(history)
    .filter((date) => !Number.isNaN(parseISO(date).getTime()))
    .sort((a, b) => parseISO(b).getTime() - parseISO(a).getTime());

  if (!dates.length) return 0;

  let streak = 0;
  let expectedDate = new Date();
  expectedDate.setHours(0, 0, 0, 0);

  for (const dateString of dates) {
    const activityDate = parseISO(dateString);
    activityDate.setHours(0, 0, 0, 0);

    const difference = differenceInDays(expectedDate, activityDate);

    if (difference >= 0 && difference <= 1) {
      streak += 1;
      expectedDate = activityDate;
    } else {
      break;
    }
  }

  return streak;
}

export default function ParentDashboard() {
  const { t } = useTranslation();
  const { fontType } = useSettings();
  const { childId } = useParams();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [hasError, setHasError] = useState(false);

  const fontClass =
    fontType === "dyslexic" ? "font-dyslexic" : "font-sans";

  useEffect(() => {
    let active = true;

    async function loadStats() {
      setHasError(false);
      setStats(null);

      try {
        const result = await getChildStats(childId);

        if (!active) return;

        if (!result) {
          setHasError(true);
          return;
        }

        setStats(result);
      } catch (error) {
        console.error("Failed to load parent dashboard:", error);

        if (active) {
          setHasError(true);
        }
      }
    }

    loadStats();

    return () => {
      active = false;
    };
  }, [childId]);

  const derived = useMemo(() => {
    if (!stats) return null;

    const rawProgress =
      stats.progress && typeof stats.progress === "object"
        ? stats.progress
        : {};

    const progress = Object.fromEntries(
      Object.entries(rawProgress).filter(([key]) =>
        KNOWN_GAMES.includes(key)
      )
    );

    const history =
      stats.playtimeHistory && typeof stats.playtimeHistory === "object"
        ? stats.playtimeHistory
        : {};

    const dates = Object.keys(history)
      .filter((date) => !Number.isNaN(parseISO(date).getTime()))
      .sort((a, b) => parseISO(a).getTime() - parseISO(b).getTime());

    const totalPlaytime = Math.max(
      0,
      safeNumber(stats.totalPlaytime)
    );

    const xp = Math.max(0, safeNumber(rawProgress.xp));
    const xpLevel = Math.max(1, safeNumber(rawProgress.level, 1));
    const keys = Math.max(
      0,
      safeNumber(rawProgress.currency?.keys)
    );

    const streak = calcStreak(history);
    const lastActive = dates.length ? dates[dates.length - 1] : null;
    const avgPerDay = dates.length
      ? Number((totalPlaytime / dates.length).toFixed(1))
      : 0;

    const refilling = Object.entries(progress).filter(([, game]) => {
      return heartStatus(game)?.isRefilling;
    });

    const readyToPlay = Object.entries(progress).filter(([, game]) => {
      const status = heartStatus(game);

      return (
        game?.unlocked &&
        status?.hearts > 0 &&
        !status?.isRefilling
      );
    });
return {
  progress,
  dates,
  minutes: dates.map((date) => Math.max(0, safeNumber(history[date]))),
  totalPlaytime,
  xp,
  xpLevel,
  keys,
  streak,
  lastActive,
  avgPerDay,
  refilling,
  readyToPlay,
};
  }, [stats]);

  if (hasError) {
    return (
      <main
        className={`flex min-h-screen items-center justify-center bg-slate-50 p-4 ${fontClass}`}
      >
        <div className="max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <span className="text-3xl" aria-hidden="true">
            ⚠️
          </span>

          <p className="mt-3 text-sm font-semibold text-slate-700">
            {t("parentDashboard.loadError", {
              defaultValue: "We could not load this dashboard.",
            })}
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            {t("parentDashboard.back")}
          </button>
        </div>
      </main>
    );
  }

  if (!stats || !derived) {
    return (
      <main
        className={`flex min-h-screen items-center justify-center bg-slate-50 ${fontClass}`}
      >
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />

          <p className="mt-3 text-sm font-medium text-slate-500">
            {t("parentDashboard.loading")}
          </p>
        </div>
      </main>
    );
  }

  const {
    progress,
    dates,
    totalPlaytime,
    xp,
    xpLevel,
    keys,
    streak,
    lastActive,
    avgPerDay,
    refilling,
    readyToPlay,
  } = derived;

  const childName =
    typeof stats.name === "string" && stats.name.trim()
      ? stats.name.trim()
      : t("parentDashboard.thisChild", {
          defaultValue: "Child",
        });

  const lastActiveLabel = lastActive
    ? format(parseISO(lastActive), "dd MMM yyyy")
    : null;

  const statCards = [
    {
      label: t("parentDashboard.totalPlaytime"),
      value: `${Math.round(totalPlaytime)} min`,
      sub: `${(totalPlaytime / 60).toFixed(1)}h total`,
      color: "bg-white border-slate-200",
    },
    {
      label: t("parentDashboard.dailyAvg"),
      value: `${avgPerDay} min`,
      sub: `${dates.length} ${t("parentDashboard.daysTracked")}`,
      color: "bg-white border-slate-200",
    },
    {
      label: t("parentDashboard.streak"),
      value: `${streak} 🔥`,
      sub:
        streak >= 3
          ? t("parentDashboard.streakGreat")
          : t("parentDashboard.streakKeepGoing"),
      color: "bg-white border-slate-200",
    },
    {
      label: t("parentDashboard.keys"),
      value: `🗝️ ${keys}`,
      color: "bg-white border-slate-200",
    },
  ];

    return (
  <>
    <main className={`min-h-screen bg-slate-50 ${fontClass}`}>
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <span aria-hidden="true">←</span>
            {t("parentDashboard.back")}
          </button>

          <PrintButton />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-xl text-white shadow-sm"
              aria-hidden="true"
            >
              👤
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {childName}
              </h1>

              <p className="mt-0.5 text-sm text-slate-500">
                {lastActiveLabel
                  ? `${t("parentDashboard.lastSeen")}: ${lastActiveLabel}`
                  : t("parentDashboard.neverPlayed")}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-violet-100 bg-violet-50 px-4 py-2 text-right">
            <p className="text-[11px] font-bold uppercase tracking-wide text-violet-500">
              {t("parentDashboard.xpLevel")}
            </p>

            <p className="text-lg font-black text-violet-700">
              {xpLevel}
              <span className="ml-1 text-xs font-semibold text-violet-500">
                · {xp} XP
              </span>
            </p>
          </div>
        </header>

        {refilling.length > 0 && (
          <div className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <span className="text-base" aria-hidden="true">
              💛
            </span>

            <p className="text-xs leading-relaxed text-amber-800">
              <strong>{t("parentDashboard.heartsRefillingTitle")}</strong>
              {" — "}
              {refilling
                .map(([gameKey]) => t(`gameCards.${gameKey}.title`))
                .join(", ")}
              {". "}
              {t("parentDashboard.heartsRefillingDesc")}
            </p>
          </div>
        )}

        <section className="mt-6">
          <StatCards cards={statCards} />
        </section>

        <section className="mt-6">
          <ProgressAssistant
            childName={childName}
            progress={progress}
            totalPlaytime={totalPlaytime}
            streak={streak}
            avgPerDay={avgPerDay}
            dates={dates}
            readyToPlay={readyToPlay}
            refilling={refilling}
          />
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                {t("parentDashboard.gameProgress")}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {t("parentDashboard.gameProgressDescription", {
                  defaultValue: "Progress recorded in each activity.",
                })}
              </p>
            </div>

            {Object.keys(progress).length > 0 && (
              <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600">
                {Object.keys(progress).length}
              </span>
            )}
          </div>

          {Object.keys(progress).length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {KNOWN_GAMES.filter((gameKey) => progress[gameKey]).map(
                (gameKey) => (
                  <GameCard
                    key={gameKey}
                    gameKey={gameKey}
                    data={progress[gameKey]}
                    t={t}
                  />
                )
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
              <span className="text-3xl" aria-hidden="true">
                🎯
              </span>

              <p className="mt-3 text-sm font-semibold text-slate-600">
                {t("parentDashboard.noProgress")}
              </p>
            </div>
          )}
        </section>
      </div>
    </main>

    <div className="print-only">
      <PrintReport stats={stats} derived={derived} />
    </div>
  </>
);
}