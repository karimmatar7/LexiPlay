// src/components/dashboard/PrintReport.jsx
import React from "react";
import { format, parseISO } from "date-fns";
import { useTranslation } from "react-i18next";
import { heartStatus } from "../../utils/heartStatus.js";

const GAMES = [
  "letterBuild",
  "wordMaze",
  "wordMatch",
  "finalWordBuilder",
  "letterDraw",
];

const number = (value, fallback = 0) =>
  typeof value === "number" && Number.isFinite(value)
    ? value
    : fallback;

const getDate = (value) => {
  if (!value || typeof value !== "string") return null;

  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDate = (value, pattern = "dd MMM yyyy") => {
  const parsed = getDate(value);
  return parsed ? format(parsed, pattern) : "—";
};

function SectionTitle({ children }) {
  return (
    <h2 className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-violet-700">
      {children}
    </h2>
  );
}

function TableHeader({ children, className = "" }) {
  return (
    <th
      className={`px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-slate-600 ${className}`}
    >
      {children}
    </th>
  );
}

export default function PrintReport({ stats = {}, derived = {} }) {
  const { t } = useTranslation();

  const progress =
    derived.progress && typeof derived.progress === "object"
      ? derived.progress
      : {};

  const dates = Array.isArray(derived.dates)
    ? derived.dates.filter(getDate)
    : [];

  const minutes = Array.isArray(derived.minutes)
    ? derived.minutes
    : [];

  const totalPlaytime = Math.max(0, number(derived.totalPlaytime));
  const avgPerDay = Math.max(0, number(Number(derived.avgPerDay)));
  const streak = Math.max(0, number(derived.streak));
  const xp = Math.max(0, number(derived.xp));
  const xpLevel = Math.max(1, number(derived.xpLevel, 1));
  const keys = Math.max(0, number(derived.keys));

  const childName =
    typeof stats.name === "string" && stats.name.trim()
      ? stats.name.trim()
      : t("parentDashboard.thisChild", {
          defaultValue: "Child",
        });

  const today = format(new Date(), "dd MMMM yyyy");

  const sessions = dates
    .map((day, index) => ({
      day,
      date: getDate(day),
      minutes: Math.max(0, number(minutes[index])),
    }))
    .filter((session) => session.date)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const recentSessions = sessions.slice(0, 7);

  const monthlyActivity = Object.values(
    sessions.reduce((months, session) => {
      const key = format(session.date, "yyyy-MM");

      if (!months[key]) {
        months[key] = {
          key,
          label: format(session.date, "MMMM yyyy"),
          days: 0,
          minutes: 0,
        };
      }

      months[key].days += 1;
      months[key].minutes += session.minutes;

      return months;
    }, {})
  );

  const games = GAMES.filter((key) => progress[key]).map((key) => {
    const game = progress[key];
    const hearts = heartStatus(game);
    const status = hearts?.isRefilling
      ? "refilling"
      : hearts?.outOfHearts
      ? "out"
      : "ready";

    return {
      key,
      level: number(game.level),
      word: number(game.levelIndex) + 1,
      hearts: Math.min(5, Math.max(0, number(hearts?.hearts, 5))),
      status,
    };
  });

  const engagement =
    avgPerDay >= 15
      ? t("parentDashboard.engagementHigh")
      : avgPerDay >= 5
      ? t("parentDashboard.engagementMedium")
      : t("parentDashboard.engagementLow");

  const overview = [
    [t("parentDashboard.xpLevel"), xpLevel],
    [t("print.totalXP"), xp],
    [t("parentDashboard.keys"), keys],
    [t("parentDashboard.streak"), streak],
  ];

  const activityStats = [
    [
      t("parentDashboard.totalPlaytime"),
      `${Math.round(totalPlaytime)} min`,
      `≈ ${(totalPlaytime / 60).toFixed(1)}h`,
    ],
    [
      t("parentDashboard.dailyAvg"),
      `${avgPerDay.toFixed(1)} min`,
      `${dates.length} ${t("parentDashboard.daysTracked")}`,
    ],
    [t("print.engagement"), engagement, ""],
  ];

  return (
    <div
      id="print-report"
      className="print-report mx-auto max-w-3xl bg-white font-sans text-slate-800"
    >
<style>{`
  @page {
    size: A4;
    margin: 13mm;
  }

  @media print {
    html,
    body,
    #root {
      width: auto !important;
      min-height: 0 !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: visible !important;
      background: #ffffff !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Hide the normal dashboard completely from print layout */
    #root > main {
      display: none !important;
    }

    /* Show only the separate print report */
    #root > .print-only {
      display: block !important;
      width: 100% !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: visible !important;
    }

    #print-report {
      display: block !important;
      width: 100% !important;
      max-width: none !important;
      min-height: 0 !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: visible !important;
      background: #ffffff !important;
      color: #1e293b !important;
      font-size: 10pt;
      line-height: 1.35;
    }

    .print-no-break,
    .print-section,
    .print-footer {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .print-table {
      break-inside: auto;
      page-break-inside: auto;
    }

    .print-table thead {
      display: table-header-group;
    }

    .print-table tr {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .print-footer {
      margin-bottom: 0 !important;
      padding-bottom: 0 !important;
    }
  }
`}</style>

      <header className="print-no-break flex items-start justify-between border-b-2 border-violet-600 pb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-600">
            LexiPlay
          </p>

          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
            {t("print.title")}
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            {t("print.generated")}: {today}
          </p>
        </div>

        <div className="text-right">
          <p className="text-lg font-bold text-slate-900">{childName}</p>

          <p className="mt-1 text-xs text-slate-500">
            {derived.lastActive
              ? `${t("parentDashboard.lastSeen")}: ${formatDate(
                  derived.lastActive
                )}`
              : t("parentDashboard.neverPlayed")}
          </p>
        </div>
      </header>

      <section className="print-section mt-5">
        <SectionTitle>{t("print.playerOverview")}</SectionTitle>

        <div className="grid grid-cols-4 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-slate-50">
          {overview.map(([label, value]) => (
            <div key={label} className="px-3 py-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {label}
              </p>

              <p className="mt-1 text-xl font-black text-violet-700">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="print-section mt-5">
        <SectionTitle>{t("print.playtimeSummary")}</SectionTitle>

        <div className="grid grid-cols-3 divide-x divide-slate-200 rounded-xl border border-slate-200">
          {activityStats.map(([label, value, helper]) => (
            <div key={label} className="px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {label}
              </p>

              <p className="mt-1 text-xl font-black text-slate-900">
                {value}
              </p>

              {helper && (
                <p className="text-xs text-slate-500">{helper}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {games.length > 0 && (
        <section className="print-section mt-5">
          <SectionTitle>{t("parentDashboard.gameProgress")}</SectionTitle>

          <table className="print-table w-full overflow-hidden rounded-xl border border-slate-200 text-sm">
            <thead className="bg-violet-50">
              <tr>
                <TableHeader className="text-left">
                  {t("print.game")}
                </TableHeader>

                <TableHeader>
                  {t("parentDashboard.level")}
                </TableHeader>

                <TableHeader>
                  {t("parentDashboard.wordNumber")}
                </TableHeader>

                <TableHeader>
                  {t("parentDashboard.hearts")}
                </TableHeader>

                <TableHeader>{t("print.status")}</TableHeader>
              </tr>
            </thead>

            <tbody>
              {games.map((game, index) => (
                <tr
                  key={game.key}
                  className={index % 2 ? "bg-slate-50" : "bg-white"}
                >
                  <td className="px-3 py-2 font-semibold text-slate-800">
                    {t(`gameCards.${game.key}.title`)}
                  </td>

                  <td className="px-3 py-2 text-center font-bold text-violet-700">
                    {game.level}
                  </td>

                  <td className="px-3 py-2 text-center font-bold text-violet-700">
                    {game.word}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2 text-center text-[11px]">
                    {Array.from({ length: 5 }, (_, index) => (
                      <span
                        key={index}
                        style={{ opacity: index < game.hearts ? 1 : 0.2 }}
                      >
                        ♥
                      </span>
                    ))}
                  </td>

                  <td className="px-3 py-2 text-center text-xs font-semibold">
                    <span
                      className={
                        game.status === "ready"
                          ? "text-emerald-700"
                          : game.status === "refilling"
                          ? "text-amber-700"
                          : "text-rose-600"
                      }
                    >
                      {t(
                        game.status === "ready"
                          ? "parentDashboard.heartsReady"
                          : game.status === "refilling"
                          ? "parentDashboard.refilling"
                          : "parentDashboard.outOfHearts"
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {monthlyActivity.length > 0 && (
        <section className="print-section mt-5">
          <SectionTitle>{t("print.monthlyActivity")}</SectionTitle>

          <table className="print-table w-full overflow-hidden rounded-xl border border-slate-200 text-sm">
            <thead className="bg-violet-50">
              <tr>
                <TableHeader className="text-left">
                  {t("print.month")}
                </TableHeader>

                <TableHeader>{t("print.activeDays")}</TableHeader>

                <TableHeader className="text-right">
                  {t("parentDashboard.totalPlaytime")}
                </TableHeader>
              </tr>
            </thead>

            <tbody>
              {monthlyActivity.map((month, index) => (
                <tr
                  key={month.key}
                  className={index % 2 ? "bg-slate-50" : "bg-white"}
                >
                  <td className="px-3 py-2 font-semibold text-slate-700">
                    {month.label}
                  </td>

                  <td className="px-3 py-2 text-center font-bold text-violet-700">
                    {month.days}
                  </td>

                  <td className="px-3 py-2 text-right font-bold text-violet-700">
                    {Math.round(month.minutes)} min
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {recentSessions.length > 0 && (
        <section className="print-section mt-5">
          <div className="mb-2 flex items-center justify-between">
            <SectionTitle>{t("print.recentActivity")}</SectionTitle>

            <span className="text-[10px] text-slate-400">
              {t("print.latestSessions", {
                count: recentSessions.length,
              })}
            </span>
          </div>

          <table className="print-table w-full overflow-hidden rounded-xl border border-slate-200 text-sm">
            <thead className="bg-violet-50">
              <tr>
                <TableHeader className="text-left">
                  {t("print.date")}
                </TableHeader>

                <TableHeader className="text-right">
                  {t("print.minutesPlayed")}
                </TableHeader>
              </tr>
            </thead>

            <tbody>
              {recentSessions.map((session, index) => (
                <tr
                  key={session.day}
                  className={index % 2 ? "bg-slate-50" : "bg-white"}
                >
                  <td className="px-3 py-1.5 text-slate-700">
                    {format(session.date, "dd MMM yyyy")}
                  </td>

                  <td className="px-3 py-1.5 text-right font-semibold text-violet-700">
                    {session.minutes.toFixed(1)} min
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <footer className="print-footer mt-6 flex justify-between border-t border-slate-200 pt-3 text-[10px] text-slate-400">
        <span>{t("print.footer")}</span>
        <span>{today}</span>
      </footer>
    </div>
  );
}