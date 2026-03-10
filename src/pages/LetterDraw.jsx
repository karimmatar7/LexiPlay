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

const LETTERS        = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const PASS_COVERAGE  = 0.15;
const PASS_PRECISION = 0.18;
const MAX_HEARTS     = 5;
const KEY_EVERY_N    = 4;

function getRandomLetter() {
  return LETTERS[Math.floor(Math.random() * LETTERS.length)];
}

/* ─── Goal Net ──────────────────────────────────────────────────────── */
function GoalNet({ ballState }) {
  const netShake = ballState === "goal";

  return (
    <div className="relative w-full select-none" style={{ height: 110 }}>
      <div
        className={`absolute inset-x-0 top-0 transition-transform duration-100 ${
          netShake ? "animate-net-shake" : ""
        }`}
        style={{ height: 90 }}
      >
        <svg
          viewBox="0 0 360 90"
          width="100%"
          height="90"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          <rect x="10" y="4" width="340" height="76" rx="2"
            fill="rgba(255,255,255,0.07)" stroke="none" />
          <rect x="8" y="4" width="344" height="6" rx="3"
            fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
          <rect x="8" y="4" width="6" height="82" rx="3"
            fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
          <rect x="346" y="4" width="6" height="82" rx="3"
            fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
          <rect x="8" y="82" width="344" height="5" rx="2"
            fill="#94a3b8" />
          {Array.from({ length: 17 }).map((_, i) => (
            <line key={`v${i}`}
              x1={28 + i * 20} y1="10" x2={28 + i * 20} y2="82"
              stroke="rgba(255,255,255,0.55)" strokeWidth="1" />
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={`h${i}`}
              x1="14" y1={16 + i * 10} x2="346" y2={16 + i * 10}
              stroke="rgba(255,255,255,0.55)" strokeWidth="1" />
          ))}
          <rect x="14" y="74" width="332" height="10"
            fill="rgba(0,0,0,0.08)" />
          {ballState === "goal" && (
            <rect x="14" y="10" width="332" height="72" rx="2"
              fill="rgba(250,204,21,0.22)"
              className="animate-pulse" />
          )}
        </svg>
      </div>

      <Ball state={ballState} />

      <div
        className="absolute bottom-0 inset-x-0 rounded-b-xl"
        style={{
          height: 22,
          background: "linear-gradient(to bottom, #4ade80, #16a34a)",
          borderTop: "3px solid #15803d",
        }}
      >
        <div className="absolute left-1/2 -translate-x-1/2 top-1 w-8 h-1 bg-white/30 rounded-full" />
      </div>
    </div>
  );
}

/* ─── Animated Ball ─────────────────────────────────────────────────── */
function Ball({ state }) {
  const baseStyle = {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "radial-gradient(circle at 35% 35%, #ffffff, #d1d5db)",
    border: "2px solid #374151",
    boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
    transition: "all 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
    zIndex: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    pointerEvents: "none",
  };

  let style = { ...baseStyle };
  if (!state)
    style = { ...style, bottom: 4,  left: "calc(50% - 14px)", transform: "scale(1)",                  opacity: 1   };
  else if (state === "shooting")
    style = { ...style, bottom: 55, left: "calc(50% - 14px)", transform: "scale(0.85)",               opacity: 1   };
  else if (state === "goal")
    style = { ...style, bottom: 40, left: "calc(50% - 14px)", transform: "scale(0.7)",                opacity: 1   };
  else if (state === "miss")
    style = { ...style, bottom: 2,  left: "calc(10% - 14px)", transform: "scale(1.1) rotate(180deg)", opacity: 0.7 };

  return <div style={style}>⚽</div>;
}

/* ─── Feedback Pill ─────────────────────────────────────────────────── */
function FeedbackPill({ feedback, goalLabel, missLabel }) {
  return (
    <div className="w-full flex justify-center items-center" style={{ height: 44 }}>
      {feedback && (
        <div
          className={`
            inline-flex items-center gap-2 px-5 py-2 rounded-full font-black text-base
            shadow-lg border-2 animate-fade-in
            ${feedback === "goal"
              ? "bg-green-400 border-green-600 text-white"
              : "bg-red-400   border-red-600   text-white"
            }
          `}
        >
          {feedback === "goal" ? `⚽ ${goalLabel}` : `❌ ${missLabel}`}
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────── */
export default function LetterDraw({ user, setUser }) {
  usePlaytimeTracker(user);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { fontType, fontSize, soundOn } = useSettings();
  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans";
  const sizeMap = {
    small:  "text-base md:text-lg",
    medium: "text-lg md:text-xl",
    large:  "text-xl md:text-2xl",
  };
  const sizeClass = sizeMap[fontSize || "medium"];

  const canvasRef     = useRef(null);
  const processingRef = useRef(false);

  const [heartsInit,       setHeartsInit]       = useState(null);
  const [cooldownInit,     setCooldownInit]     = useState(null);
  const [loaded,           setLoaded]           = useState(false);
  const [paused,           setPaused]           = useState(false);
  const [showResetModal,   setShowResetModal]   = useState(false);
  const [showLeaderboard,  setShowLeaderboard]  = useState(false); // ← correctly inside component

  const [currentLetter, setCurrentLetter] = useState(getRandomLetter);
  const [score,         setScore]         = useState(0);
  const [feedback,      setFeedback]      = useState(null);
  const [ballState,     setBallState]     = useState(null);
  const [justLeveledUp, setJustLeveledUp] = useState(false);
  const [keyStreak,     setKeyStreak]     = useState(0);
  const [keyJustEarned, setKeyJustEarned] = useState(false);

  const xp    = user?.progress?.xp    || 0;
  const level = user?.progress?.level || 1;
  const keys  = user?.progress?.currency?.keys || 0;

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from("users").select("progress").eq("id", user.id).single();
      const progress = data?.progress?.letterDraw || {};
      setHeartsInit(progress.hearts ?? MAX_HEARTS);
      setCooldownInit(progress.cooldownUntil ?? null);
      setScore(progress.score ?? 0);
      setLoaded(true);
    };
    load();
  }, [user?.id]);

  const {
    hearts, cooldownUntil, heartAnimating, loseHeart,
    maxHearts, heartsReady, setHearts, setCooldownUntil,
  } = useHearts({
    user,
    gameKey: "letterDraw",
    initialHearts: heartsInit,
    initialCooldown: cooldownInit,
  });

  useEffect(() => {
    canvasRef.current?.clear();
  }, [currentLetter]);

  const saveScore = useCallback(async (newScore) => {
    if (!user?.id) return;
    const { data } = await supabase
      .from("users").select("progress").eq("id", user.id).single();
    const existing = data?.progress || {};
    const prevHigh = existing?.letterDraw?.highScore || 0;
    await supabase.from("users").update({
      progress: {
        ...existing,
        letterDraw: {
          ...(existing.letterDraw || {}),
          score: newScore,
          highScore: Math.max(newScore, prevHigh),
        },
      },
    }).eq("id", user.id);
  }, [user?.id]);

  const handleSubmit = useCallback(async () => {
    if (processingRef.current || feedback || hearts <= 0 || paused) return;
    processingRef.current = true;

    const drawnData  = canvasRef.current?.getCompositeImageData();
    const targetData = getLetterImageData(currentLetter);
    const { coverage, precision } = drawnData
      ? calcScores(targetData, drawnData)
      : { coverage: 0, precision: 0 };

    const isGoal = coverage >= PASS_COVERAGE && precision >= PASS_PRECISION;

    setBallState("shooting");

    if (isGoal) {
      setTimeout(() => setBallState("goal"), 300);
      setFeedback("goal");

      let nextScore;
      setScore((prev) => { nextScore = prev + 1; return nextScore; });

      const newStreak = keyStreak + 1;
      const earnKey   = newStreak >= KEY_EVERY_N;

      const result = await addKeysAndXP(user.id, earnKey ? 1 : 0, 10);
      if (result) {
        setUser((prev) => ({
          ...prev,
          progress: {
            ...result.user.progress,
            letterDraw: {
              ...(result.user.progress?.letterDraw || {}),
              score: nextScore,
            },
          },
        }));
        if (result.leveledUp) {
          setJustLeveledUp(true);
          setTimeout(() => setJustLeveledUp(false), 3000);
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

      let nextScore;
      setScore((prev) => { nextScore = Math.max(0, prev - 1); return nextScore; });
      setKeyStreak(0);
      await loseHeart();
      await saveScore(nextScore);
    }

    setTimeout(() => {
      setFeedback(null);
      setBallState(null);
      setCurrentLetter(getRandomLetter());
      processingRef.current = false;
    }, 1400);

  }, [feedback, hearts, paused, currentLetter, keyStreak, loseHeart, user?.id, setUser, saveScore]);

  const handleReset = useCallback(async () => {
    setScore(0);
    setKeyStreak(0);
    setFeedback(null);
    setBallState(null);
    setCurrentLetter(getRandomLetter());
    processingRef.current = false;
    setShowResetModal(false);
    canvasRef.current?.clear();
    await updateProgress(user?.id, { letterDraw: { score: 0 } });
  }, [user?.id]);

  // ── Guards ──
  if (!loaded || !heartsReady)
    return <LoadingScreen fontClass={fontClass} sizeMap={sizeMap} />;

  if (hearts <= 0)
    return (
      <NoHeartsScreen
        hearts={hearts}
        cooldownUntil={cooldownUntil}
        fontClass={fontClass}
        sizeClass={sizeClass}
        userId={user.id}
        gameKey="letterDraw"
        onHeartsRefilled={(updatedUser) => {
          const g = updatedUser.progress.letterDraw;
          setHearts(g.hearts);
          setCooldownUntil(g.cooldownUntil);
          setUser(updatedUser);
        }}
      />
    );

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
        onPauseToggle={() => setPaused((p) => !p)}
        onHome={() => navigate("/menu")}
        onReset={() => setShowResetModal(true)}
      >
        <HeartsDisplay hearts={hearts} heartAnimating={heartAnimating} maxHearts={maxHearts} />
        <XPBadge xp={xp} level={level} />
        <KeyStreakBar
          keyStreak={keyStreak}
          keyEveryN={KEY_EVERY_N}
          justEarned={keyJustEarned}
          soundOn={soundOn}
        />

        {/* Score counter + leaderboard button */}
        <div className="flex items-center justify-between w-full mt-1 mb-2">
          <span className="text-sm font-bold text-slate-500">
            {t("letterDraw.score")}:{" "}
            <span className="text-indigo-600 text-base font-extrabold">{score}</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              +1 {t("letterDraw.goal")} / -1 {t("letterDraw.miss")}
            </span>
            <button
              onClick={() => setShowLeaderboard(true)}
              className="flex items-center gap-1 px-3 py-1 bg-indigo-100 hover:bg-indigo-200
                text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200
                transition-all active:scale-95 shrink-0"
            >
              🏆 {t("leaderboard.button", "Ranks")}
            </button>
          </div>
        </div>

        {/* ── GOAL NET ── */}
        <div className="w-full max-w-[min(100%,380px)] mx-auto mb-0">
          <div
            className="rounded-2xl overflow-hidden shadow-xl border-2 border-slate-300"
            style={{
              background: "linear-gradient(180deg, #1e3a5f 0%, #1e4d8c 40%, #2563eb 70%, #3b82f6 100%)",
              padding: "10px 10px 0 10px",
            }}
          >
            <div className="flex justify-around mb-1 px-4 opacity-40">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/70" />
              ))}
            </div>
            <GoalNet ballState={ballState} />
          </div>
        </div>

        {/* ── FEEDBACK PILL — between net and canvas ── */}
        <FeedbackPill
          feedback={feedback}
          goalLabel={t("letterDraw.goal")}
          missLabel={t("letterDraw.miss")}
        />

        {/* ── DRAWING CANVAS ── */}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-[min(100%,360px)] sm:max-w-sm">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-slate-500 text-sm">{t("letterDraw.instruction")}</span>
              <span className="text-4xl font-black text-indigo-600 leading-none">{currentLetter}</span>
            </div>

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

        {/* Buttons */}
        <div className="flex gap-3 w-full max-w-[min(100%,360px)] sm:max-w-sm mx-auto mt-3">
          <button
            onClick={() => canvasRef.current?.clear()}
            disabled={!!feedback || paused}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl border border-slate-200 disabled:opacity-40 transition-all"
          >
            🧹 {t("letterDraw.clear")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!!feedback || paused}
            className="flex-[2] bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-2xl shadow border-b-4 border-indigo-700 disabled:opacity-40 transition-all active:scale-95"
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
