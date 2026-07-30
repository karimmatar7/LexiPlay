// src/pages/ParentDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { differenceInDays, format, parseISO } from "date-fns";
import { useTranslation } from "react-i18next";

import { getChildStats } from "../utils/parent.js";
import { heartStatus } from "../utils/heartStatus.js";
import { useSettings } from "../context/SettingsContext";

import AppButton from "../components/AppButton";
import GameCard from "../components/dashboard/GameCard";
import PrintButton from "../components/dashboard/PrintButton";
import PrintReport from "../components/dashboard/PrintReport";
import ProgressAssistant from "../components/dashboard/ProgressAssistant";
import StatCards from "../components/dashboard/StatCards";
import AvatarCanvas from "../components/AvatarCanvas";
import streakIcon from "../assets/icons/fire.png";
import keyIcon from "../assets/icons/key.png";

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
  const expectedDate = new Date();
  expectedDate.setHours(0, 0, 0, 0);

  for (const dateString of dates) {
    const activityDate = parseISO(dateString);
    activityDate.setHours(0, 0, 0, 0);

    const difference = differenceInDays(expectedDate, activityDate);

    if (difference >= 0 && difference <= 1) {
      streak += 1;
      expectedDate.setTime(activityDate.getTime());
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

    const totalPlaytime = Math.max(0, safeNumber(stats.totalPlaytime));
    const xp = Math.max(0, safeNumber(rawProgress.xp));
    const xpLevel = Math.max(1, safeNumber(rawProgress.level, 1));
    const keys = Math.max(0, safeNumber(rawProgress.currency?.keys));

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
      minutes: dates.map((date) =>
        Math.max(0, safeNumber(history[date]))
      ),
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
        className={`flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-violet-50/50 p-4 ${fontClass}`}
      >
        <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-8">
          <span className="text-4xl" aria-hidden="true">
            ⚠️
          </span>

          <h1 className="mt-4 text-lg font-black text-slate-900">
            {t("parentDashboard.loadErrorTitle", {
              defaultValue: "Dashboard unavailable",
            })}
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {t("parentDashboard.loadError", {
              defaultValue: "We could not load this dashboard.",
            })}
          </p>

          <AppButton
            type="button"
            onClick={() => navigate(-1)}
            variant="indigo"
            className="mt-6"
          >
            {t("parentDashboard.back")}
          </AppButton>
        </div>
      </main>
    );
  }

  if (!stats || !derived) {
    return (
      <main
        className={`flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-violet-50/50 p-4 ${fontClass}`}
      >
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />

          <p className="mt-4 text-sm font-semibold text-slate-500">
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

  const gameCount = Object.keys(progress).length;

  const streakValue = (
    <span className="inline-flex items-center gap-1.5">
      <span>{streak}</span>
      <img
        src={streakIcon}
        alt=""
        aria-hidden="true"
        className="h-4 w-4 object-contain"
      />
    </span>
  );

const statCards = [
  {
    label: t("parentDashboard.totalPlaytime"),
    value: `${Math.round(totalPlaytime)} min`,
    sub: `${(totalPlaytime / 60).toFixed(1)}h ${t("parentDashboard.total", {
      defaultValue: "total",
    })}`,
    color: "border-violet-100 bg-white",
  },
  {
    label: t("parentDashboard.dailyAvg"),
    value: `${avgPerDay} min`,
    sub: `${dates.length} ${t("parentDashboard.daysTracked")}`,
    color: "border-sky-100 bg-white",
  },
  {
    label: t("parentDashboard.streak"),
    value: streakValue,
    sub:
      streak >= 3
        ? t("parentDashboard.streakGreat")
        : t("parentDashboard.streakKeepGoing"),
    color: "border-orange-100 bg-white",
  },
  {
    label: t("parentDashboard.keys"),
    value: (
      <span className="inline-flex items-center gap-1.5">
        <img
          src={keyIcon}
          alt=""
          aria-hidden="true"
          className="h-5 w-5 shrink-0 object-contain"
        />
        <span>{keys}</span>
      </span>
    ),
    color: "border-amber-100 bg-white",
  },
];

  return (
    <>
      <main
        className={`min-h-screen overflow-x-hidden bg-gradient-to-b from-slate-50 via-slate-50 to-violet-50/50 ${fontClass}`}
      >
        {/* Sticky action bar */}
        <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <AppButton
              type="button"
              onClick={() => navigate(-1)}
              variant="neutral"
              size="sm"
              className="shrink-0"
            >
              <span aria-hidden="true">←</span>
              <span>{t("parentDashboard.back")}</span>
            </AppButton>

            <PrintButton />
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          {/* Child summary */}
          <header className="rounded-3xl border border-white/80 bg-white/85 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)] backdrop-blur-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
       <div
  className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full sm:h-14 sm:w-14"
  aria-hidden="true"
>
  {stats.avatar ? (
    <AvatarCanvas avatar={stats.avatar} size={56} animated={false} fullBody={false} />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-600 text-xl text-white sm:text-2xl">
      👤
    </div>
  )}
</div>

                <div className="min-w-0">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-violet-500">
                    {t("parentDashboard.thisChild", {
                      defaultValue: "Child",
                    })}
                  </p>

                  <h1 className="truncate text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                    {childName}
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    {lastActiveLabel
                      ? `${t("parentDashboard.lastSeen")}: ${lastActiveLabel}`
                      : t("parentDashboard.neverPlayed")}
                  </p>
                </div>
              </div>

              <div className="self-start rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 px-4 py-3 text-left sm:self-auto sm:text-right">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-violet-500">
                  {t("parentDashboard.xpLevel")}
                </p>

                <p className="mt-0.5 text-xl font-black text-violet-700">
                  {xpLevel}
                  <span className="ml-1 text-xs font-semibold text-violet-500">
                    · {xp} XP
                  </span>
                </p>
              </div>
            </div>
          </header>

          {/* Refill warning */}
          {refilling.length > 0 && (
            <section
              className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 shadow-sm"
              aria-live="polite"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-base" aria-hidden="true">
                  💛
                </span>

                <p className="text-sm leading-relaxed text-amber-900">
                  <strong>{t("parentDashboard.heartsRefillingTitle")}</strong>
                  {" — "}
                  {refilling
                    .map(([gameKey]) => t(`gameCards.${gameKey}.title`))
                    .join(", ")}
                  {". "}
                  {t("parentDashboard.heartsRefillingDesc")}
                </p>
              </div>
            </section>
          )}

          {/* Summary statistics */}
          <section className="mt-6 sm:mt-8">
            <StatCards cards={statCards} />
          </section>

          {/* Parent guidance */}
          <section className="mt-6 sm:mt-8">
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

          {/* Game progress */}
          <section className="mt-8 sm:mt-10">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-500">
                  {t("parentDashboard.gameProgress")}
                </p>

                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  {t("parentDashboard.gameProgress")}
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
                  {t("parentDashboard.gameProgressDescription")}
                </p>
              </div>

              {gameCount > 0 && (
                <span
                  className="inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 px-3 text-sm font-black text-violet-700"
                  aria-label={`${gameCount} games`}
                >
                  {gameCount}
                </span>
              )}
            </div>

            {gameCount > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-5">
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
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 px-6 py-12 text-center shadow-sm">
                <span className="text-4xl" aria-hidden="true">
                  🎯
                </span>

                <p className="mt-4 text-sm font-bold text-slate-700">
                  {t("parentDashboard.noProgress")}
                </p>

                <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                  {t("parentDashboard.noProgressDescription", {
                    defaultValue:
                      "Game progress will appear here after the first activity.",
                  })}
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