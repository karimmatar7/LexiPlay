// src/components/dashboard/ProgressAssistant.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import foxIcon from "../../assets/icons/fox.png";
import dashboardIcon from "../../assets/icons/dashboard.png";
import starIcon from "../../assets/icons/star.png";
import gamesIcon from "../../assets/icons/games.png";
import plantIcon from "../../assets/icons/plant.png";
import calendarIcon from "../../assets/icons/calendar.png";


const GAME_ORDER = [
  "wordMatch",
  "letterBuild",
  "wordMaze",
  "finalWordBuilder",
  "letterDraw",
];

const SCORE_STRENGTH = 70;

const isNumber = (value) =>
  typeof value === "number" && Number.isFinite(value);

const number = (value, fallback = 0) =>
  isNumber(value) ? value : fallback;

const integer = (value, fallback = 0) =>
  Math.max(0, Math.floor(number(value, fallback)));

function score(value) {
  if (!isNumber(value)) return null;

  const percentage = value >= 0 && value <= 1 ? value * 100 : value;

  return percentage >= 0 && percentage <= 100
    ? Math.round(percentage)
    : null;
}

function firstNumber(object = {}, fields = []) {
  return fields.map((field) => object?.[field]).find(isNumber) ?? null;
}

function gameName(key, t) {
  return t(`gameCards.${key}.title`);
}

function readGame(key, rawGame = {}) {
  const game =
    rawGame && typeof rawGame === "object" ? rawGame : {};

  const sessions = integer(
    firstNumber(game, [
      "sessions",
      "gamesPlayed",
      "completed",
      "roundsCompleted",
      "totalPlayed",
    ])
  );

  const level = integer(
    firstNumber(game, ["level", "currentLevel", "unlockedLevel"])
  );

  const word = integer(
    firstNumber(game, [
      "levelIndex",
      "wordIndex",
      "currentWord",
      "wordNumber",
    ])
  );

  const rawScore = score(
    firstNumber(game, [
      "accuracy",
      "percentage",
      "percent",
      "bestScore",
      "score",
    ])
  );

  /*
   * A score is only meaningful after at least one completed game/round.
   * `score: 0` is often an untouched default value in saved game state.
   */
  const validScore = sessions > 0 ? rawScore : null;

  /*
   * level 0 + first word is an initial state, not evidence of progress.
   * The game needs at least one actual advancement or completed session.
   */
  const hasMeaningfulProgress =
    sessions > 0 ||
    level > 0 ||
    word > 0 ||
    validScore !== null;

  return {
    key,
    level,
    word,
    sessions,
    score: validScore,
    hasMeaningfulProgress,
  };
}

function FoxGuide({ waving, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="relative shrink-0 rounded-full outline-none focus:ring-4 focus:ring-orange-200"
    >
      <style>{`
        @keyframes lexi-fox-pop {
          0% { opacity: 0; transform: scale(0.72); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes lexi-fox-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes lexi-fox-wave {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-20deg); }
          40% { transform: rotate(20deg); }
          60% { transform: rotate(-15deg); }
          80% { transform: rotate(14deg); }
        }

        .lexi-fox-avatar {
          animation:
            lexi-fox-pop 420ms cubic-bezier(.2,.8,.2,1) both,
            lexi-fox-float 3.1s ease-in-out 500ms infinite;
        }

        .lexi-fox-wave {
          transform-origin: 76px 76px;
          animation: lexi-fox-wave 900ms ease-in-out 2;
        }

        @media (prefers-reduced-motion: reduce) {
          .lexi-fox-avatar,
          .lexi-fox-wave {
            animation: none !important;
          }
        }
      `}</style>

      <svg
        className="lexi-fox-avatar h-14 w-14 drop-shadow-lg transition-transform duration-200 hover:scale-105 sm:h-[96px] sm:w-[96px]"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="lexifox-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE2C0" />
            <stop offset="100%" stopColor="#FFD0A3" />
          </linearGradient>

          <linearGradient
            id="lexifox-orange"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#FF9A32" />
            <stop offset="100%" stopColor="#E85A13" />
          </linearGradient>

          <linearGradient
            id="lexifox-cream"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FFE7D1" />
          </linearGradient>

          <linearGradient
            id="lexifox-headphones"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#2DD4D5" />
            <stop offset="100%" stopColor="#167A91" />
          </linearGradient>
        </defs>

        <circle cx="50" cy="50" r="48" fill="url(#lexifox-bg)" />
        <circle cx="21" cy="18" r="10" fill="#FFFFFF" opacity="0.24" />
        <circle cx="79" cy="22" r="8" fill="#FFFFFF" opacity="0.16" />

        <path
          d="M20 53V40C20 20 34 12 50 12C66 12 80 20 80 40V53"
          fill="none"
          stroke="#26324A"
          strokeWidth="7"
          strokeLinecap="round"
        />

        <rect
          x="13"
          y="46"
          width="14"
          height="28"
          rx="7"
          fill="url(#lexifox-headphones)"
          stroke="#14566A"
          strokeWidth="1.5"
        />

        <rect
          x="73"
          y="46"
          width="14"
          height="28"
          rx="7"
          fill="url(#lexifox-headphones)"
          stroke="#14566A"
          strokeWidth="1.5"
        />

        <path
          d="M24 46L22 16Q23 10 29 14L46 34Z"
          fill="url(#lexifox-orange)"
          stroke="#C54A11"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        <path
          d="M76 46L78 16Q77 10 71 14L54 34Z"
          fill="url(#lexifox-orange)"
          stroke="#C54A11"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        <path d="M28 34L27 20L40 36Z" fill="#FFF4EA" />
        <path d="M72 34L73 20L60 36Z" fill="#FFF4EA" />

        <path
          d="M23 48C23 29 35 21 50 21C65 21 77 29 77 48C77 70 66 84 50 84C34 84 23 70 23 48Z"
          fill="url(#lexifox-orange)"
        />

        <path
          d="M32 39Q40 29 48 36L50 45L52 36Q60 29 68 39Q61 37 56 42L50 49L44 42Q39 37 32 39Z"
          fill="#FFF7F0"
        />

        <path
          d="M27 57Q31 48 42 51Q47 54 50 59Q53 54 58 51Q69 48 73 57Q71 75 50 78Q29 75 27 57Z"
          fill="url(#lexifox-cream)"
        />

        <path d="M31 52Q37 45 44 52Q38 61 31 52Z" fill="#FFFFFF" />
        <path d="M56 52Q63 45 69 52Q62 61 56 52Z" fill="#FFFFFF" />

        <ellipse cx="38" cy="53" rx="4.3" ry="5.4" fill="#155E75" />
        <ellipse cx="62" cy="53" rx="4.3" ry="5.4" fill="#155E75" />
        <ellipse cx="38" cy="54" rx="2.4" ry="3.6" fill="#26324A" />
        <ellipse cx="62" cy="54" rx="2.4" ry="3.6" fill="#26324A" />
        <circle cx="39.2" cy="51.5" r="1.2" fill="#FFFFFF" />
        <circle cx="63.2" cy="51.5" r="1.2" fill="#FFFFFF" />

        <path
          d="M46 62Q50 59 54 62Q53 66 50 66Q47 66 46 62Z"
          fill="#2F2630"
        />

        <path
          d="M50 66V68"
          fill="none"
          stroke="#2F2630"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        <path
          d="M40 69Q50 78 60 69"
          fill="none"
          stroke="#2F2630"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <path
          d="M30 84Q39 78 50 81Q61 78 70 84V100H30Z"
          fill="#5B67E8"
        />

        <g className={waving ? "lexi-fox-wave" : ""}>
          <path
            d="M69 84Q78 77 82 67Q84 62 87 64Q89 66 87 71L85 75L91 70Q94 68 96 71Q97 73 94 76L89 80L95 79Q98 79 98 82Q98 85 94 85L88 86Q84 94 76 96Z"
            fill="#FF8E2D"
            stroke="#C54A11"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </g>
      </svg>

      <span className="absolute -right-1 top-0 rounded-full border-2 border-white bg-orange-500 px-1.5 py-0.5 text-[9px] font-black text-white shadow-sm">
        AI
      </span>
    </button>
  );
}

function QuestionButton({ icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left text-xs font-bold transition sm:text-sm ${
        active
          ? "border-orange-300 bg-orange-100 text-orange-950 shadow-sm"
          : "border-slate-100 bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50"
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-base ${
          active ? "bg-white" : "bg-orange-50"
        }`}
        aria-hidden="true"
      >
        {icon}
      </span>

      <span className="leading-snug">{label}</span>
    </button>
  );
}

function AnswerPanel({ answer, t }) {
  return (
    <div className="rounded-2xl border-2 border-orange-100 bg-orange-50/50 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-xl shadow-sm">
          <img
            src={foxIcon}
            alt="Fox"
            aria-hidden="true"
            className="h-6 w-6 object-contain"
            draggable="false"
          />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
            {t("progressAssistant.foxSays")}
          </p>

          <h3 className="mt-1 text-base font-black text-slate-800">
            {answer.title}
          </h3>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-700">
        {answer.body}
      </p>

      {answer.tips.length > 0 && (
        <div className="mt-4 border-t border-orange-100 pt-4">
          <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500">
            {t("progressAssistant.helpfulIdeas")}
          </p>

          <ul className="space-y-2">
            {answer.tips.map((tip, index) => (
              <li
                key={`${tip}-${index}`}
                className="flex items-start gap-2 rounded-xl bg-white p-3 text-xs leading-relaxed text-slate-700 shadow-sm"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500 text-[10px] font-black text-white">
                  {index + 1}
                </span>

                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function ProgressAssistant({
  childName,
  progress = {},
  totalPlaytime = 0,
  streak = 0,
  avgPerDay = 0,
  dates = [],
  readyToPlay = [],
  refilling = [],
}) {
  const { t } = useTranslation();

const [isOpen, setIsOpen] = useState(false);
  const [isWaving, setIsWaving] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState("summary");

  useEffect(() => {
    const timer = window.setTimeout(() => setIsWaving(false), 2000);
    return () => window.clearTimeout(timer);
  }, []);

  const safeName =
    typeof childName === "string" && childName.trim()
      ? childName.trim()
      : t("progressAssistant.thisChild");

  const activity = useMemo(() => {
    const safeProgress =
      progress && typeof progress === "object" ? progress : {};

    const games = GAME_ORDER.filter((key) => safeProgress[key]).map((key) =>
      readGame(key, safeProgress[key])
    );

const activeGames = games.filter(
  (game) => game.hasMeaningfulProgress
);

const recordedGames = games.filter(
  (game) =>
    game.hasMeaningfulProgress ||
    game.sessions > 0 ||
    game.score !== null
);
    const scoredGames = activeGames.filter(
      (game) => game.score !== null
    );

    const validDates = Array.isArray(dates)
      ? dates.filter((date) => typeof date === "string" && date.trim())
      : [];

    const minutes = Math.max(0, number(totalPlaytime));
    const average = Math.max(0, number(Number(avgPerDay)));
    const currentStreak = Math.max(0, integer(streak));

const furthestGame =
  [...activeGames]
    .filter(
      (game) =>
        game.level > 0 ||
        game.word > 0 ||
        game.sessions > 0
    )
    .sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level;
      if (b.word !== a.word) return b.word - a.word;
      if (b.sessions !== a.sessions) return b.sessions - a.sessions;
      return a.key.localeCompare(b.key);
    })[0] || null;

    const strongestGame =
      [...scoredGames]
        .filter((game) => game.score >= SCORE_STRENGTH)
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return b.sessions - a.sessions;
        })[0] || null;

    const focusGame =
      [...scoredGames]
        .filter((game) => game.score < SCORE_STRENGTH)
        .sort((a, b) => {
          if (a.score !== b.score) return a.score - b.score;
          return b.sessions - a.sessions;
        })[0] || null;

    const readyKeys = Array.isArray(readyToPlay)
      ? readyToPlay
          .map((item) => (Array.isArray(item) ? item[0] : item))
          .filter((key) => typeof key === "string")
      : [];

    const refillingKeys = Array.isArray(refilling)
      ? refilling
          .map((item) => (Array.isArray(item) ? item[0] : item))
          .filter((key) => typeof key === "string")
      : [];

    return {
      activeGames,
        recordedGames,
      validDates,
      minutes,
      average,
      currentStreak,
      furthestGame,
      strongestGame,
      focusGame,
      readyKeys,
      refillingKeys,
hasActivity:
  minutes > 0 ||
  validDates.length > 0 ||
  recordedGames.length > 0,
    };
  }, [
    avgPerDay,
    dates,
    progress,
    readyToPlay,
    refilling,
    streak,
    totalPlaytime,
  ]);

  const questions = useMemo(
    () => [
      {
        id: "summary",
        icon: <img src={dashboardIcon} alt="Dashboard" className="h-6 w-6" />,
        label: t("progressAssistant.questions.summary"),
      },
      {
        id: "strength",
        icon: <img src={starIcon} alt="Star" className="h-6 w-6" />,
        label: t("progressAssistant.questions.strength"),
      },
      {
        id: "focus",
        icon: <img src={plantIcon} alt="Plant" className="h-6 w-6" />,
        label: t("progressAssistant.questions.focus"),
      },
      {
        id: "routine",
        icon: <img src={calendarIcon} alt="Calendar" className="h-6 w-6" />,
        label: t("progressAssistant.questions.routine"),
      },
      {
        id: "session",
        icon: <img src={gamesIcon} alt="Games" className="h-6 w-6" />,
        label: t("progressAssistant.questions.session"),
      },
    ],
    [t]
  );

  const answer = useMemo(() => {
    const {
      activeGames,
      recordedGames,
      validDates,
      minutes,
      average,
      currentStreak,
      furthestGame,
      strongestGame,
      focusGame,
      readyKeys,
      refillingKeys,
      hasActivity,
    } = activity;

    const noActivity = {
      title: t("progressAssistant.answers.summaryEmptyTitle"),
      body: t("progressAssistant.answers.summaryEmptyBody"),
      tips: [
        t("progressAssistant.answers.summaryEmptyTip1"),
        t("progressAssistant.answers.summaryEmptyTip2"),
      ],
    };

    if (selectedQuestion === "summary") {
      if (!hasActivity) return noActivity;

      return {
        title: t("progressAssistant.answers.summaryTitle"),
        body: t("progressAssistant.answers.summaryBody", {
          name: safeName,
          minutes: Math.round(minutes),
          days: validDates.length,
          games: recordedGames.length,
        }),
        tips: [
          currentStreak > 0
            ? t("progressAssistant.answers.streakTip", {
                days: currentStreak,
              })
            : t("progressAssistant.answers.noStreakTip"),
          average > 0
            ? t("progressAssistant.answers.averageTip", {
                minutes: average.toFixed(1),
              })
            : t("progressAssistant.answers.activityRecordedTip"),
        ],
      };
    }

    if (selectedQuestion === "strength") {
      if (!hasActivity) return noActivity;

      if (strongestGame) {
        return {
          title: t("progressAssistant.answers.strengthTitle"),
          body: t("progressAssistant.answers.strengthBody", {
            game: gameName(strongestGame.key, t),
            score: strongestGame.score,
            sessions: strongestGame.sessions,
          }),
          tips: [
            t("progressAssistant.answers.strengthTip1"),
            t("progressAssistant.answers.strengthTip2"),
          ],
        };
      }

      if (furthestGame) {
        return {
          title: t("progressAssistant.answers.progressTitle"),
          body: t("progressAssistant.answers.progressBody", {
            game: gameName(furthestGame.key, t),
            level: furthestGame.level,
            word: furthestGame.word + 1,
          }),
          tips: [
            t("progressAssistant.answers.progressTip1"),
            t("progressAssistant.answers.progressTip2"),
          ],
        };
      }

      return {
        title: t("progressAssistant.answers.activityTitle"),
        body: t("progressAssistant.answers.activityBody", {
          name: safeName,
        }),
        tips: [t("progressAssistant.answers.activityTip")],
      };
    }

    if (selectedQuestion === "focus") {
      if (!hasActivity) return noActivity;

      if (focusGame) {
        return {
          title: t("progressAssistant.answers.focusTitle"),
          body: t("progressAssistant.answers.focusBody", {
            game: gameName(focusGame.key, t),
            score: focusGame.score,
            sessions: focusGame.sessions,
          }),
          tips: [
            t("progressAssistant.answers.focusTip1"),
            t("progressAssistant.answers.focusTip2"),
          ],
        };
      }

      if (furthestGame) {
        return {
          title: t("progressAssistant.answers.focusProgressTitle"),
          body: t("progressAssistant.answers.focusProgressBody", {
            game: gameName(furthestGame.key, t),
          }),
          tips: [
            t("progressAssistant.answers.focusProgressTip1"),
            t("progressAssistant.answers.focusProgressTip2"),
          ],
        };
      }

      return {
        title: t("progressAssistant.answers.focusStartTitle"),
        body: t("progressAssistant.answers.focusStartBody"),
        tips: [t("progressAssistant.answers.focusStartTip")],
      };
    }

    if (selectedQuestion === "routine") {
      if (!hasActivity) return noActivity;

      const body =
        currentStreak >= 5
          ? t("progressAssistant.answers.routineGreatBody", {
              days: currentStreak,
            })
          : currentStreak >= 2
          ? t("progressAssistant.answers.routineGrowingBody", {
              days: currentStreak,
            })
          : t("progressAssistant.answers.routineBody");

      return {
        title: t("progressAssistant.answers.routineTitle"),
        body,
        tips: [
          t("progressAssistant.answers.routineTip1"),
          t("progressAssistant.answers.routineTip2"),
          t("progressAssistant.answers.routineTip3"),
        ],
      };
    }

    if (!hasActivity) return noActivity;

    const nextGame =
      readyKeys[0] ||
      furthestGame?.key ||
      strongestGame?.key ||
      activeGames[0]?.key ||
      null;

    return {
      title: t("progressAssistant.answers.sessionTitle"),
      body: nextGame
        ? t("progressAssistant.answers.sessionBody", {
            game: gameName(nextGame, t),
            name: safeName,
          })
        : t("progressAssistant.answers.sessionNoGameBody"),
      tips: [
        t("progressAssistant.answers.sessionTip1"),
        refillingKeys.length > 0
          ? t("progressAssistant.answers.sessionHeartsTip")
          : t("progressAssistant.answers.sessionTip2"),
      ],
    };
  }, [activity, safeName, selectedQuestion, t]);

  function openFox() {
    setIsOpen(true);
    setIsWaving(true);

    window.setTimeout(() => {
      setIsWaving(false);
    }, 2000);
  }

  return (
<section
  className="overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)] sm:rounded-3xl sm:border-2"
      aria-label={t("progressAssistant.ariaLabel")}
    >
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-100 via-amber-50 to-sky-100 p-3 sm:p-5">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/40 blur-2xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-orange-300/20 blur-xl" />

        <div className="relative flex items-center gap-2 sm:gap-4">
          <FoxGuide
            waving={isWaving}
            onClick={openFox}
            label={t("progressAssistant.openFox")}
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-black text-slate-800 sm:text-lg">
                {t("progressAssistant.title")}
              </h2>

              <span className="rounded-full border border-orange-200 bg-white/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-700">
                {t("progressAssistant.badge")}
              </span>
            </div>

            <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-600 sm:text-sm">
              {t("progressAssistant.greeting")}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className="rounded-xl border-2 border-orange-200 bg-white px-3 py-2 text-xs font-bold text-orange-700 transition hover:bg-orange-50 focus:outline-none focus:ring-4 focus:ring-orange-200"
            aria-expanded={isOpen}
          >
            {isOpen
              ? t("progressAssistant.hide")
              : t("progressAssistant.show")}
          </button>
        </div>
      </div>

 {isOpen && (
  <div className="p-3 sm:p-5">
    {/* Mobile: horizontal question selector */}
    <div className="sm:hidden">
      <p className="mb-2 px-1 text-xs font-black uppercase tracking-wide text-slate-500">
        {t("progressAssistant.chooseQuestion")}
      </p>

      <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {questions.map((question) => (
          <button
            key={question.id}
            type="button"
            onClick={() => setSelectedQuestion(question.id)}
            className={`flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-bold transition ${
              selectedQuestion === question.id
                ? "border-orange-300 bg-orange-100 text-orange-950 shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50"
            }`}
            aria-pressed={selectedQuestion === question.id}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center">
              {question.icon}
            </span>

            <span className="whitespace-nowrap">{question.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-3">
        <AnswerPanel answer={answer} t={t} />
      </div>
    </div>

    {/* Tablet and desktop: question list + answer */}
    <div className="hidden sm:grid sm:grid-cols-1 sm:gap-3 lg:grid-cols-[0.9fr_1.35fr]">
      <div>
        <p className="mb-2 px-1 text-xs font-black uppercase tracking-wide text-slate-500">
          {t("progressAssistant.chooseQuestion")}
        </p>

        <div className="space-y-2">
          {questions.map((question) => (
            <QuestionButton
              key={question.id}
              icon={question.icon}
              label={question.label}
              active={selectedQuestion === question.id}
              onClick={() => setSelectedQuestion(question.id)}
            />
          ))}
        </div>
      </div>

      <AnswerPanel answer={answer} t={t} />
    </div>

    <p className="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-[10px] leading-relaxed text-slate-500 sm:mt-4">
      {t("progressAssistant.note")}
    </p>
  </div>
)}
    </section>
  );
}