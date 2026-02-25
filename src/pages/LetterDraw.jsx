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

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const PASS_COVERAGE = 0.38;
const PASS_PRECISION = 0.40;
const MAX_HEARTS = 5;
const KEY_EVERY_N = 4;

function getRandomLetter() {
  return LETTERS[Math.floor(Math.random() * LETTERS.length)];
}

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

  const [currentLetter, setCurrentLetter] = useState(getRandomLetter);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [justLeveledUp, setJustLeveledUp] = useState(false);
  const [keyStreak, setKeyStreak] = useState(0);
  const [keyJustEarned, setKeyJustEarned] = useState(false);

  const xp = user?.progress?.xp || 0;
  const level = user?.progress?.level || 1;
  const keys = user?.progress?.currency?.keys || 0;

  /**
   * ✅ IMPORTANT FIX:
   * Don't reload score every time `user` changes (because scoring a goal calls setUser -> triggers reload -> overwrites UI score with stale DB).
   * Only load when the user ID changes (first time / user switch).
   */
  useEffect(() => {
    const load = async () => {
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
    };
    load();
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

  // Clear drawing layer when letter changes
  useEffect(() => {
    canvasRef.current?.clear();
  }, [currentLetter]);

  // Persist score to DB (reads fresh progress so no overwrites)
  const saveScore = useCallback(
    async (newScore) => {
      if (!user?.id) return;

      const { data } = await supabase
        .from("users")
        .select("progress")
        .eq("id", user.id)
        .single();

      const existing = data?.progress || {};
      const prevHigh = existing?.letterDraw?.highScore || 0;

      await supabase
        .from("users")
        .update({
          progress: {
            ...existing,
            letterDraw: {
              ...(existing.letterDraw || {}),
              score: newScore,
              highScore: Math.max(newScore, prevHigh),
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

    const drawnData = canvasRef.current?.getCompositeImageData();
    const targetData = getLetterImageData(currentLetter);

    const { coverage, precision } = drawnData
      ? calcScores(targetData, drawnData)
      : { coverage: 0, precision: 0 };

    const isGoal = coverage >= PASS_COVERAGE && precision >= PASS_PRECISION;

    if (isGoal) {
      setFeedback("goal");

      // ✅ compute nextScore from current state reliably (no stale closure)
      let nextScore;
      setScore((prev) => {
        nextScore = prev + 1;
        return nextScore;
      });

      const newStreak = keyStreak + 1;
      const earnKey = newStreak >= KEY_EVERY_N;

      // XP/keys update (this triggers setUser, but our load effect won't overwrite score anymore)
      const result = await addKeysAndXP(user.id, earnKey ? 1 : 0, 10);
      if (result) {
        setUser((prev) => ({ ...prev, progress: result.user.progress }));
        if (result.leveledUp) {
          setJustLeveledUp(true);
          setTimeout(() => setJustLeveledUp(false), 3000);
        }
      }

      // ✅ persist after score is calculated (nextScore is set by updater)
      await saveScore(nextScore);

      if (earnKey) {
        setKeyStreak(0);
        setKeyJustEarned(true);
        setTimeout(() => setKeyJustEarned(false), 1500);
      } else {
        setKeyStreak(newStreak);
      }
    } else {
      setFeedback("miss");

      let nextScore;
      setScore((prev) => {
        nextScore = Math.max(0, prev - 1);
        return nextScore;
      });

      setKeyStreak(0);
      await loseHeart();
      await saveScore(nextScore);
    }

    setTimeout(() => {
      setFeedback(null);
      setCurrentLetter(getRandomLetter());
      processingRef.current = false;
    }, 1400);
  }, [
    feedback,
    hearts,
    paused,
    currentLetter,
    keyStreak,
    loseHeart,
    user?.id,
    user?.id, // keep
    setUser,
    saveScore,
  ]);

  // Reset (also saves 0)
  const handleReset = useCallback(async () => {
    setScore(0);
    setKeyStreak(0);
    setFeedback(null);
    setCurrentLetter(getRandomLetter());
    processingRef.current = false;
    setShowResetModal(false);
    canvasRef.current?.clear();

    // keep your existing helper
    await updateProgress(user?.id, { letterDraw: { score: 0 } });
  }, [user?.id]);

  // Guards
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
          const g = updatedUser.progress.letterDraw;
          setHearts(g.hearts);
          setCooldownUntil(g.cooldownUntil);
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

        {/* Score counter */}
        <div className="flex items-center justify-between w-full mt-1 mb-2">
          <span className="text-sm font-bold text-slate-500">
            {t("letterDraw.score")}:{" "}
            <span className="text-indigo-600 text-base font-extrabold">{score}</span>
          </span>
          <span className="text-xs text-slate-400">
            +1 {t("letterDraw.goal")} / -1 {t("letterDraw.miss")}
          </span>
        </div>

        {/* Canvas */}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-[min(100%,360px)] sm:max-w-sm">
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

        {/* Instruction */}
        <p className="text-slate-500 text-sm text-center mt-2">
          {t("letterDraw.instruction")}{" "}
          <strong className="text-indigo-600 text-lg">{currentLetter}</strong>
        </p>

        {/* Buttons */}
        <div className="flex gap-3 w-full max-w-[min(100%,360px)] sm:max-w-sm mx-auto mt-1">
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
    </>
  );
}