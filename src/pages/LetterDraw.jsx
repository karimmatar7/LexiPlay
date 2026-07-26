// src/pages/LetterDraw.jsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSettings } from "../context/SettingsContext";
import { supabase } from "../supaBaseClient";
import { addKeysAndXP } from "../supabaseFunctions";
import { updateProgress } from "../utils/user";
import { useHearts } from "../hooks/useHearts";
import NoHeartsScreen from "../components/NoHeartsScreen";
import LoadingScreen from "../components/LoadingScreen";
import { HeartsDisplay } from "../components/HeartsDisplay";
import XPBadge from "../components/XPBadge";
import LevelUpToast from "../components/LevelUpToast";
import KeyStreakBar from "../components/KeyStreakBar";
import GameContainer from "../components/GameContainer";
import ResetConfirmationModal from "../components/ResetConfirmationModal";
import DrawingCanvas from "../components/DrawingCanvas";
import { getLetterImageData, calcScores } from "../utils/letterScoring";
import usePlaytimeTracker from "../hooks/usePlaytimeTracker";
import LeaderboardOverlay from "../components/LeaderboardOverlay";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const PASS_COVERAGE = 0.42;
const PASS_PRECISION = 0.5;
const PASS_F1 = 0.46;
const MIN_DRAWN_INK = 0.012;
const MAX_DRAWN_INK = 0.3;
const MAX_CENTER_GAP = 0.25;

const MAX_HEARTS = 5;
const KEY_EVERY_N = 4;

const LETTER_COVERAGE = {
  I: 0.32,
  L: 0.34,
  T: 0.34,
  F: 0.35,
  E: 0.38,
  H: 0.38,
  U: 0.42,
  C: 0.42,
  O: 0.45,
  Q: 0.45,
};

function getRandomLetter() {
  return LETTERS[Math.floor(Math.random() * LETTERS.length)];
}

function getInkStats(imageData) {
  if (!imageData?.data) {
    return {
      inkRatio: 0,
      cx: 0.5,
      cy: 0.5,
      widthRatio: 0,
      heightRatio: 0,
      hasInk: false,
    };
  }

  const { data, width, height } = imageData;

  let count = 0;
  let sumX = 0;
  let sumY = 0;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];

      if (alpha > 80) {
        count += 1;
        sumX += x;
        sumY += y;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (!count) {
    return {
      inkRatio: 0,
      cx: 0.5,
      cy: 0.5,
      widthRatio: 0,
      heightRatio: 0,
      hasInk: false,
    };
  }

  return {
    inkRatio: count / (width * height),
    cx: sumX / count / width,
    cy: sumY / count / height,
    widthRatio: (maxX - minX + 1) / width,
    heightRatio: (maxY - minY + 1) / height,
    hasInk: true,
  };
}

function getF1Score(coverage, precision) {
  if (coverage + precision === 0) return 0;

  return (2 * coverage * precision) / (coverage + precision);
}

function isStrongLetterMatch({
  coverage,
  precision,
  targetData,
  drawnData,
  neededCoverage = PASS_COVERAGE,
}) {
  const f1 = getF1Score(coverage, precision);
  const targetStats = getInkStats(targetData);
  const drawnStats = getInkStats(drawnData);

  if (!drawnStats.hasInk) return false;

  const centerGap = Math.hypot(
    targetStats.cx - drawnStats.cx,
    targetStats.cy - drawnStats.cy
  );

  const enoughCoverage = coverage >= neededCoverage;
  const enoughPrecision = precision >= PASS_PRECISION;
  const balancedEnough = f1 >= PASS_F1;
  const notTooEmpty = drawnStats.inkRatio >= MIN_DRAWN_INK;
  const notTooMessy = drawnStats.inkRatio <= MAX_DRAWN_INK;
  const centeredEnough = centerGap <= MAX_CENTER_GAP;

  const sizeLooksGood =
    drawnStats.widthRatio >= targetStats.widthRatio * 0.35 &&
    drawnStats.heightRatio >= targetStats.heightRatio * 0.35;

  return (
    enoughCoverage &&
    enoughPrecision &&
    balancedEnough &&
    notTooEmpty &&
    notTooMessy &&
    centeredEnough &&
    sizeLooksGood
  );
}

/* ─── Stadium visuals ──────────────────────────────────────────────── */

function GoalConfetti() {
  const colors = [
    "bg-yellow-300",
    "bg-pink-400",
    "bg-purple-400",
    "bg-orange-400",
    "bg-emerald-300",
    "bg-cyan-300",
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {Array.from({ length: 28 }).map((_, index) => (
        <span
          key={index}
          className={`absolute h-2.5 w-2.5 rounded-sm ${
            colors[index % colors.length]
          } animate-confetti-fall`}
          style={{
            left: `${4 + ((index * 19) % 92)}%`,
            top: `${-10 - (index % 5) * 10}px`,
            animationDelay: `${(index % 8) * 0.055}s`,
            animationDuration: `${0.85 + (index % 4) * 0.12}s`,
            transform: `rotate(${index * 33}deg)`,
          }}
        />
      ))}
    </div>
  );
}

function Ball({ state }) {
  let animationClass = "ball-idle";

  if (state === "shooting") animationClass = "ball-shoot";
  if (state === "goal") animationClass = "ball-goal";
  if (state === "miss") animationClass = "ball-miss";

  return (
    <div
      className={`absolute z-20 flex h-11 w-11 items-center justify-center text-[42px] leading-none drop-shadow-[0_6px_4px_rgba(15,23,42,0.28)] ${animationClass}`}
      aria-hidden="true"
    >
      ⚽
    </div>
  );
}

function GoalNet({ ballState }) {
  const isGoal = ballState === "goal";

  return (
    <div
      className={`relative h-[190px] w-full select-none overflow-hidden rounded-[22px] ${
        isGoal ? "animate-stadium-pop" : ""
      }`}
    >
      {/* Sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-200 to-cyan-100" />

      {/* Decorative sky */}
      <div className="absolute -right-6 -top-7 h-20 w-20 rounded-full border-4 border-yellow-200 bg-yellow-300 shadow-[0_0_22px_rgba(250,204,21,0.72)]" />

      <div className="absolute left-6 top-7 text-3xl opacity-95 animate-cloud-drift">
        ☁️
      </div>

      <div
        className="absolute right-20 top-11 text-2xl opacity-80 animate-cloud-drift"
        style={{ animationDelay: "-2.5s" }}
      >
        ☁️
      </div>

      <div className="absolute left-4 top-[76px] text-lg animate-star-float">
        ⭐
      </div>

      <div
        className="absolute right-6 top-[73px] text-base animate-star-float"
        style={{ animationDelay: "-1.2s" }}
      >
        ✨
      </div>

      {/* Crowd */}
      <div className="absolute bottom-9 inset-x-0 h-9 overflow-hidden bg-indigo-700/90">
        <div className="absolute -top-1 whitespace-nowrap text-lg tracking-[5px] animate-crowd-wave">
          🧒🏽 👧🏻 🧒🏼 👧🏾 🧒🏻 👧🏼 🧒🏿 👧🏽 🧒🏾 👧🏻 🧒🏼 👧🏿
        </div>
      </div>

      {/* Goal */}
      <div
        className={`absolute bottom-8 left-1/2 h-[106px] w-[84%] max-w-[340px] -translate-x-1/2 ${
          isGoal ? "animate-net-bounce" : ""
        }`}
      >
        <div className="absolute inset-x-3 bottom-1 top-3 overflow-hidden rounded-md border border-white/40 bg-white/20">
          <div
            className="absolute inset-0 opacity-80"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.62) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.62) 1px, transparent 1px)
              `,
              backgroundSize: "17px 13px",
            }}
          />

          {isGoal && (
            <div className="absolute inset-0 bg-yellow-300/30 animate-pulse" />
          )}
        </div>

        <div className="absolute inset-x-0 top-0 h-3 rounded-full border-2 border-slate-300 bg-gradient-to-b from-white to-slate-200 shadow-md" />

        <div className="absolute bottom-0 left-0 top-0 w-3 rounded-full border-2 border-slate-300 bg-gradient-to-r from-white to-slate-200 shadow-md" />

        <div className="absolute bottom-0 right-0 top-0 w-3 rounded-full border-2 border-slate-300 bg-gradient-to-l from-white to-slate-200 shadow-md" />

        {isGoal && (
          <div className="pointer-events-none absolute -inset-4 rounded-3xl border-4 border-yellow-300 animate-goal-ring" />
        )}
      </div>

      <Ball state={ballState} />

      {isGoal && <GoalConfetti />}

      {/* Pitch */}
      <div className="absolute bottom-0 inset-x-0 h-10 border-t-4 border-emerald-600 bg-gradient-to-b from-emerald-400 to-green-600">
        <div className="absolute left-1/2 top-3 h-1 w-14 -translate-x-1/2 rounded-full bg-white/70" />
      </div>
    </div>
  );
}

function FeedbackPill({ feedback, goalLabel, missLabel }) {
  return (
    <div
      className="flex w-full items-center justify-center"
      style={{ height: 52 }}
      aria-live="polite"
    >
      {feedback && (
        <div
          className={`inline-flex items-center gap-2 rounded-full border-2 px-5 py-2.5 text-base font-black shadow-lg animate-feedback-pop ${
            feedback === "goal"
              ? "border-yellow-200 bg-gradient-to-r from-emerald-400 to-green-500 text-white"
              : "border-red-200 bg-gradient-to-r from-rose-400 to-red-500 text-white"
          }`}
        >
          <span className="text-xl">
            {feedback === "goal" ? "🎉" : "💪"}
          </span>

          <span>
            {feedback === "goal" ? `${goalLabel}!` : `${missLabel}!`}
          </span>

          <span className="text-xl">
            {feedback === "goal" ? "⚽" : "✏️"}
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Main component ───────────────────────────────────────────────── */

export default function LetterDraw({ user, setUser }) {
  usePlaytimeTracker(user);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { fontType, fontSize, soundOn } = useSettings();

  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans";

  const sizeMap = {
    small: "text-base md:text-lg",
    medium: "text-lg md:text-xl",
    large: "text-xl md:text-2xl",
  };

  const sizeClass = sizeMap[fontSize || "medium"];

  const canvasRef = useRef(null);
  const processingRef = useRef(false);

  const [heartsInit, setHeartsInit] = useState(null);
  const [cooldownInit, setCooldownInit] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [paused, setPaused] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const [currentLetter, setCurrentLetter] = useState(getRandomLetter);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [ballState, setBallState] = useState(null);
  const [justLeveledUp, setJustLeledUp] = useState(false);
  const [keyStreak, setKeyStreak] = useState(0);
  const [keyJustEarned, setKeyJustEarned] = useState(false);

  const xp = user?.progress?.xp || 0;
  const level = user?.progress?.level || 1;
  const keys = user?.progress?.currency?.keys || 0;

  useEffect(() => {
    async function loadGameProgress() {
      if (!user?.id) return;

      const { data } = await supabase
        .from("users")
        .select("progress")
        .eq("id", user.id)
        .single();

      const progress = data?.progress?.letterDraw || {};

      setHeartsInit(progress.hearts ?? MAX_HEARTS);
      setCooldownInit(progress.cooldownUntil ?? null);
      setScore(progress.score ?? 0);
      setLoaded(true);
    }

    loadGameProgress();
  }, [user?.id]);

  const {
    hearts,
    cooldownUntil,
    heartAnimating,
    loseHeart,
    maxHearts,
    heartsReady,
    setHearts,
    setCooldownUntil,
  } = useHearts({
    user,
    gameKey: "letterDraw",
    initialHearts: heartsInit,
    initialCooldown: cooldownInit,
  });

  useEffect(() => {
    canvasRef.current?.clear();
  }, [currentLetter]);

  const saveScore = useCallback(
    async (newScore) => {
      if (!user?.id) return;

      const { data } = await supabase
        .from("users")
        .select("progress")
        .eq("id", user.id)
        .single();

      const existing = data?.progress || {};
      const previousHighScore = existing?.letterDraw?.highScore || 0;

      await supabase
        .from("users")
        .update({
          progress: {
            ...existing,
            letterDraw: {
              ...(existing.letterDraw || {}),
              score: newScore,
              highScore: Math.max(newScore, previousHighScore),
            },
          },
        })
        .eq("id", user.id);
    },
    [user?.id]
  );

  const handleSubmit = useCallback(async () => {
    if (processingRef.current || feedback || hearts <= 0 || paused) return;

    processingRef.current = true;

    const drawnData =
      canvasRef.current?.getDrawingImageData?.() ||
      canvasRef.current?.getCompositeImageData?.();

    const strokeStats = canvasRef.current?.getStrokeStats?.() || {
      totalLength: 0,
      strokeCount: 1,
      lengthRatio: 1,
    };

    const targetData = getLetterImageData(currentLetter);

    const { coverage, precision } = drawnData
      ? calcScores(targetData, drawnData)
      : { coverage: 0, precision: 0 };

    const neededCoverage = LETTER_COVERAGE[currentLetter] ?? PASS_COVERAGE;

    const isGoal =
      isStrongLetterMatch({
        coverage,
        precision,
        targetData,
        drawnData,
        neededCoverage,
      }) &&
      strokeStats.lengthRatio >= 0.55 &&
      strokeStats.strokeCount <= 10;

    setBallState("shooting");

    if (isGoal) {
      setTimeout(() => setBallState("goal"), 300);
      setFeedback("goal");

      let nextScore = score + 1;

      setScore((previousScore) => {
        nextScore = previousScore + 1;
        return nextScore;
      });

      const newStreak = keyStreak + 1;
      const earnKey = newStreak >= KEY_EVERY_N;

      const result = await addKeysAndXP(user.id, earnKey ? 1 : 0, 10);

      if (result) {
        setUser((previousUser) => ({
          ...previousUser,
          progress: {
            ...result.user.progress,
            letterDraw: {
              ...(result.user.progress?.letterDraw || {}),
              score: nextScore,
            },
          },
        }));

        if (result.leveledUp) {
          setJustLeledUp(true);
          setTimeout(() => setJustLeledUp(false), 3000);
        }
      }

      await saveScore(nextScore);

      if (earnKey) {
        setKeyStreak(0);
        setKeyJustEarned(true);
        setTimeout(() => setKeyJustEarned(false), 1500);
      } else {
        setKeyStreak(newStreak);
      }
    } else {
      setTimeout(() => setBallState("miss"), 300);
      setFeedback("miss");

      let nextScore = Math.max(0, score - 1);

      setScore((previousScore) => {
        nextScore = Math.max(0, previousScore - 1);
        return nextScore;
      });

      setKeyStreak(0);

      await loseHeart();
      await saveScore(nextScore);
    }

    setTimeout(() => {
      setFeedback(null);
      setBallState(null);
      setCurrentLetter(getRandomLetter());
      processingRef.current = false;
    }, 1700);
  }, [
    currentLetter,
    feedback,
    hearts,
    keyStreak,
    loseHeart,
    paused,
    saveScore,
    score,
    setUser,
    user?.id,
  ]);

  const handleReset = useCallback(async () => {
    setScore(0);
    setKeyStreak(0);
    setFeedback(null);
    setBallState(null);
    setCurrentLetter(getRandomLetter());
    processingRef.current = false;
    setShowResetModal(false);

    canvasRef.current?.clear();

    await updateProgress(user?.id, {
      letterDraw: { score: 0 },
    });
  }, [user?.id]);

  if (!loaded || !heartsReady) {
    return <LoadingScreen fontClass={fontClass} sizeMap={sizeMap} />;
  }

  if (hearts <= 0) {
    return (
      <NoHeartsScreen
        hearts={hearts}
        cooldownUntil={cooldownUntil}
        fontClass={fontClass}
        sizeClass={sizeClass}
        userId={user.id}
        gameKey="letterDraw"
        onHeartsRefilled={(updatedUser) => {
          const gameProgress = updatedUser.progress.letterDraw;

          setHearts(gameProgress.hearts);
          setCooldownUntil(gameProgress.cooldownUntil);
          setUser(updatedUser);
        }}
      />
    );
  }

  return (
    <>
      <GameContainer
        fontClass={fontClass}
        sizeClass={sizeClass}
        bgColor="bg-sky-50"
        bgVariant="default"
        score={score}
        total={null}
        keys={keys}
        paused={paused}
        progress={0}
        feedback={feedback}
        onPauseToggle={() => setPaused((isPaused) => !isPaused)}
        onHome={() => navigate("/menu")}
        onReset={() => setShowResetModal(true)}
      >
        <HeartsDisplay
          hearts={hearts}
          heartAnimating={heartAnimating}
          maxHearts={maxHearts}
        />

        <XPBadge xp={xp} level={level} />

        <KeyStreakBar
          keyStreak={keyStreak}
          keyEveryN={KEY_EVERY_N}
          justEarned={keyJustEarned}
          soundOn={soundOn}
        />

        <div className="mt-1 mb-3 flex w-full items-center justify-between gap-2">
          <div className="rounded-xl border border-indigo-100 bg-white px-3 py-1.5 shadow-sm">
            <span className="text-sm font-bold text-slate-500">
              {t("letterDraw.score")}:{" "}
            </span>

            <span className="text-base font-extrabold text-indigo-600">
              {score}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-semibold text-slate-400 sm:inline">
              +1 {t("letterDraw.goal")} / -1 {t("letterDraw.miss")}
            </span>

            <button
              type="button"
              onClick={() => setShowLeaderboard(true)}
              className="flex min-h-10 shrink-0 items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-100 px-3 py-2 text-xs font-bold text-indigo-700 transition-all hover:bg-indigo-200 active:scale-95"
            >
              🏆 {t("leaderboard.button", "Ranks")}
            </button>
          </div>
        </div>

        <div className="mx-auto mb-1 w-full max-w-[min(100%,400px)]">
          <div className="overflow-hidden rounded-[28px] border-[3px] border-white bg-sky-100 p-2 shadow-[0_10px_0_#93c5fd,0_18px_30px_rgba(30,64,175,0.22)]">
            <GoalNet ballState={ballState} />
          </div>
        </div>

        <FeedbackPill
          feedback={feedback}
          goalLabel={t("letterDraw.goal")}
          missLabel={t("letterDraw.miss")}
        />

        <div className="flex w-full justify-center">
          <div className="w-full max-w-[min(100%,380px)] rounded-[28px] border-[3px] border-indigo-100 bg-white p-3 shadow-[0_8px_0_#c7d2fe,0_16px_25px_rgba(99,102,241,0.12)] sm:max-w-sm">
            <div className="mb-3 flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 px-3 py-2.5">
              <span className="text-2xl" aria-hidden="true">
                ✏️
              </span>

              <span className="text-sm font-bold text-slate-600">
                {t("letterDraw.instruction")}
              </span>

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-indigo-200 bg-white text-4xl font-black leading-none text-indigo-600 shadow-sm">
                {currentLetter}
              </div>
            </div>

            <div className="rounded-2xl border-2 border-dashed border-indigo-200 bg-gradient-to-b from-indigo-50/80 to-white p-2">
              <DrawingCanvas
                ref={canvasRef}
                letter={currentLetter}
                feedback={feedback}
                feedbackGoalLabel={t("letterDraw.goal")}
                feedbackMissLabel={t("letterDraw.miss")}
                paused={paused}
                disabled={!!feedback}
              />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-4 flex w-full max-w-[min(100%,380px)] gap-3 sm:max-w-sm">
          <button
            type="button"
            onClick={() => canvasRef.current?.clear()}
            disabled={!!feedback || paused}
            className="min-h-12 flex-1 rounded-2xl border-2 border-slate-200 bg-slate-100 py-3 font-bold text-slate-700 transition-all hover:bg-slate-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            🧹 {t("letterDraw.clear")}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!!feedback || paused}
            className="min-h-12 flex-[1.65] rounded-2xl border-b-4 border-indigo-700 bg-gradient-to-r from-indigo-500 to-violet-500 py-3 font-black text-white shadow-md transition-all hover:from-indigo-600 hover:to-violet-600 active:translate-y-0.5 active:scale-95 active:border-b-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ⚽ {t("letterDraw.shoot")}
          </button>
        </div>
      </GameContainer>

      <LevelUpToast level={level} show={justLeveledUp} />

      {showResetModal && (
        <ResetConfirmationModal
          onCancel={() => setShowResetModal(false)}
          onConfirm={handleReset}
        />
      )}

      {showLeaderboard && (
        <LeaderboardOverlay
          currentUserId={user?.id}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </>
  );
}