import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useSettings } from "../context/SettingsContext";
import GameContainer from "../components/GameContainer";
import LoadingScreen from "../components/LoadingScreen";
import ResetConfirmationModal from "../components/ResetConfirmationModal";
import NoHeartsScreen from "../components/NoHeartsScreen";
import { HeartsDisplay } from "../components/HeartsDisplay";
import { useHearts } from "../hooks/useHearts";
import XPBadge from "../components/XPBadge";
import LevelUpToast from "../components/LevelUpToast";
import KeyStreakBar from "../components/KeyStreakBar";
import AppButton from "../components/AppButton";

import usePlaytimeTracker from "../hooks/usePlaytimeTracker";
import { addKeysAndXP, addReward, getUser, updateProgress } from "../supabaseFunctions";
import { calculateStars } from "../utils/progressStars";
import wordChangeLevels from "../data/wordChangeLevels.json";

const TOTAL_ROUNDS = 20;
const MAX_HEARTS = 5;
const KEY_EVERY_N = 4;

const warningSeenKey = (userId) => `finalWordBuilder_warningSeen_${userId}`;

const shuffle = (items = []) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const getLanguage = (v = "nl") =>
  v.toLowerCase().startsWith("en") ? "en" : v.toLowerCase().startsWith("fr") ? "fr" : "nl";

function isValidRound(round) {
  const { id, pattern, changeIndex, startLetter, choices, validAnswers } = round || {};
  return Boolean(
    typeof id === "string" &&
      typeof pattern === "string" &&
      Number.isInteger(changeIndex) &&
      pattern[changeIndex] === "_" &&
      typeof startLetter === "string" &&
      startLetter.length === 1 &&
      Array.isArray(choices) &&
      choices.includes(startLetter) &&
      validAnswers?.[startLetter]?.word &&
      Object.entries(validAnswers).some(
        ([letter, answer]) =>
          choices.includes(letter) &&
          typeof answer?.word === "string" &&
          answer.word.length === pattern.length
      )
  );
}

const getLanguageRounds = (language) =>
  (wordChangeLevels?.[language] || []).filter(
    (round) => isValidRound(round) && round.id.startsWith(`${language}-`)
  );

const getRoundSet = (language) => shuffle(getLanguageRounds(language)).slice(0, TOTAL_ROUNDS);

function savedRoundsAreCurrent(savedRounds, language) {
  if (!Array.isArray(savedRounds) || savedRounds.length < 3) return false;
  const source = new Map(getLanguageRounds(language).map((round) => [round.id, round]));
  return savedRounds.every(
    (round) =>
      source.has(round?.id) && JSON.stringify(source.get(round.id)) === JSON.stringify(round)
  );
}

function WordBoxes({ word, changeIndex, changed, fontClass }) {
  if (!word) return null;
  return (
    <div className={`flex justify-center gap-1.5 sm:gap-2.5 ${fontClass}`} aria-label={word}>
      {word.split("").map((letter, i) => (
        <div
          key={`${letter}-${i}`}
          className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 text-lg font-black xs:h-11 xs:w-11 sm:h-14 sm:w-14 sm:text-2xl md:h-16 md:w-16 md:text-3xl ${
            i === changeIndex
              ? changed
                ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                : "border-violet-400 bg-violet-50 text-violet-700"
              : "border-slate-200 bg-white text-slate-800"
          }`}
        >
          {letter.toUpperCase()}
        </div>
      ))}
    </div>
  );
}

function LetterButton({ letter, onChoose, disabled, wrong, isStart, fontClass }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChoose(letter)}
      className={`relative flex aspect-square min-h-[52px] items-center justify-center rounded-xl border-b-4 text-xl font-black uppercase text-white shadow-sm transition active:translate-y-0.5 active:border-b-2 disabled:cursor-not-allowed disabled:opacity-55 sm:min-h-[68px] sm:text-2xl md:min-h-[80px] md:text-3xl ${
        wrong
          ? "border-rose-700 bg-rose-500"
          : isStart
            ? "border-slate-400 bg-slate-400"
            : "border-violet-700 bg-violet-500 hover:-translate-y-0.5 hover:bg-violet-600"
      } ${fontClass}`}
    >
      {letter}
      {isStart && (
        <span className="absolute bottom-1 text-[7px] font-black normal-case tracking-normal text-white/80 sm:text-[8px]">
          start
        </span>
      )}
    </button>
  );
}

function GlobalLockWarningModal({ onClose, t }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl border-2 border-red-300 shadow-2xl max-w-sm w-full p-6 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-black text-red-600 mb-3">
          {t("finalWordBuilder.warningTitle")}
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-5">
          {t("finalWordBuilder.warningDesc")}
        </p>
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3 mb-5">
          <p className="text-xs text-red-700 font-semibold flex items-center justify-center gap-2">
            <span>🔒</span>
            <span>{t("finalWordBuilder.warningLockAll")}</span>
          </p>
        </div>
        <AppButton type="button" onClick={onClose} variant="red" className="w-full rounded-2xl">
          <span aria-hidden="true">✅</span>
          <span>{t("finalWordBuilder.warningUnderstood")}</span>
        </AppButton>
      </div>
    </div>
  );
}

export default function FinalWordBuilder({ user, setUser }) {
  usePlaytimeTracker(user);

  const { t, i18n } = useTranslation();
  const { fontType, fontSize } = useSettings();
  const navigate = useNavigate();
  const keySoundRef = useRef(null);

  const language = getLanguage(i18n.language);
  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans";
  const sizeClass = { small: "text-base", medium: "text-lg", large: "text-xl" }[fontSize] || "text-lg";

  const [loaded, setLoaded] = useState(false);
  const [rounds, setRounds] = useState([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [wrongLetter, setWrongLetter] = useState(null);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [streak, setStreak] = useState(0);
  const [keyEarned, setKeyEarned] = useState(false);
  const [leveledUp, setLeveledUp] = useState(false);
  const [heartsInit, setHeartsInit] = useState(null);
  const [cooldownInit, setCooldownInit] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [progress, setProgress] = useState({ score: 0, rewardsEarned: [false, false, false] });

  const {
    hearts, cooldownUntil, heartAnimating, maxHearts, heartsReady,
    setHearts, setCooldownUntil, loseHeart,
  } = useHearts({ user, gameKey: "finalWordBuilder", initialHearts: heartsInit, initialCooldown: cooldownInit });

  const round = useMemo(() => rounds[index] || null, [rounds, index]);
  const startLetter = round?.startLetter || "";
  const startAnswer = round?.validAnswers?.[startLetter];
  const answer = round?.validAnswers?.[selectedLetter];
  const startWord = startAnswer?.word || "";
  const newWord = answer?.word || "";

  const keys = user?.progress?.currency?.keys || 0;
  const xp = user?.progress?.xp || 0;
  const level = user?.progress?.level || 1;

  const playKeySound = useCallback(() => {
    const sound = keySoundRef.current;
    if (!sound) return;
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }, []);

  const makeProgress = useCallback(
    (nextRounds, nextIndex, rewards = progress.rewardsEarned) => ({
      score: nextIndex,
      rewardsEarned: rewards,
      gameState: { rounds: nextRounds, currentIndex: nextIndex, language },
    }),
    [language, progress.rewardsEarned]
  );

  const saveProgress = useCallback(
    async (nextProgress) => {
      if (!user?.id) return;
      setProgress(nextProgress);
      const updated = await updateProgress(user.id, { finalWordBuilder: nextProgress });
      if (updated?.progress) setUser((p) => ({ ...p, progress: updated.progress }));
    },
    [setUser, user?.id]
  );

  useEffect(() => {
    let active = true;
    async function loadGame() {
      if (!user?.id) return;
      setLoaded(false);
      try {
        const currentUser = await getUser(user.id);
        if (!active) return;
        const saved = currentUser?.progress?.finalWordBuilder || {};
        const state = saved.gameState || {};
        const canResume = state.language === language && savedRoundsAreCurrent(state.rounds, language);
        const nextRounds = canResume ? state.rounds : getRoundSet(language);
        const nextIndex = canResume
          ? Math.min(Math.max(0, Number(state.currentIndex) || 0), Math.max(nextRounds.length - 1, 0))
          : 0;
        const nextProgress = {
          score: canResume ? saved.score || nextIndex : 0,
          rewardsEarned: canResume && Array.isArray(saved.rewardsEarned) ? saved.rewardsEarned : [false, false, false],
          gameState: { rounds: nextRounds, currentIndex: nextIndex, language },
        };
        setHeartsInit(saved.hearts ?? MAX_HEARTS);
        setCooldownInit(saved.cooldownUntil ?? null);
        setRounds(nextRounds);
        setIndex(nextIndex);
        setProgress(nextProgress);
        if (!canResume) await saveProgress(nextProgress);
      } catch (error) {
        console.error("Could not load Final Word Builder:", error);
        if (active) {
          setRounds(getRoundSet(language));
          setIndex(0);
        }
      } finally {
        if (active) setLoaded(true);
      }
    }
    loadGame();
    return () => { active = false; };
  }, [language, saveProgress, user?.id]);

  useEffect(() => {
    const saved = user?.progress?.finalWordBuilder;
    if (saved?.hearts === undefined) return;
    setHearts(saved.hearts);
    setCooldownUntil(saved.cooldownUntil ?? null);
  }, [setCooldownUntil, setHearts, user?.progress?.finalWordBuilder?.hearts]);

  useEffect(() => {
    setWrongLetter(null);
    setSelectedLetter(null);
    setAnswered(false);
  }, [index, language]);

  useEffect(() => {
    if (!user?.id) return;
    const seen = localStorage.getItem(warningSeenKey(user.id));
    if (!seen) setShowWarning(true);
  }, [user?.id]);

  const handleCloseWarning = () => {
    if (user?.id) localStorage.setItem(warningSeenKey(user.id), "true");
    setShowWarning(false);
  };

  const awardStars = async (nextIndex, nextRounds, base) => {
    const percent = Math.min(((nextIndex + 1) / nextRounds.length) * 100, 100);
    const stars = calculateStars(percent);
    const rewards = [...base.rewardsEarned];
    let earned = 0;
    for (let i = 0; i < stars; i += 1) {
      if (!rewards[i]) {
        rewards[i] = true;
        earned += 1;
      }
    }
    if (earned) await addReward(user.id, earned);
    return { ...base, rewardsEarned: rewards };
  };

  const chooseLetter = async (letter) => {
    if (paused || answered || wrongLetter || !round || letter === startLetter) return;

    if (!round.validAnswers?.[letter]?.word) {
      setWrongLetter(letter);
      setStreak(0);
      await loseHeart?.();
      window.setTimeout(() => setWrongLetter(null), 650);
      return;
    }

    setSelectedLetter(letter);
    setAnswered(true);

    const nextStreak = streak + 1;
    const earnedKey = nextStreak >= KEY_EVERY_N;
    const result = await addKeysAndXP(user.id, earnedKey ? 1 : 0, 10);

    if (result?.user?.progress) setUser((p) => ({ ...p, progress: result.user.progress }));
    if (result?.leveledUp) {
      setLeveledUp(true);
      window.setTimeout(() => setLeveledUp(false), 3000);
    }

    if (earnedKey) {
      setStreak(0);
      setKeyEarned(true);
      playKeySound();
      window.setTimeout(() => setKeyEarned(false), 1500);
    } else {
      setStreak(nextStreak);
    }
  };

  const nextRound = async () => {
    const nextIndex = index + 1;
    if (nextIndex >= rounds.length) {
      const nextRounds = getRoundSet(language);
      const nextProgress = makeProgress(nextRounds, 0, [false, false, false]);
      setRounds(nextRounds);
      setIndex(0);
      setStreak(0);
      await saveProgress(nextProgress);
      return;
    }
    const base = makeProgress(rounds, nextIndex);
    const nextProgress = await awardStars(nextIndex, rounds, base);
    setIndex(nextIndex);
    await saveProgress(nextProgress);
  };

  const resetGame = async () => {
    const nextRounds = getRoundSet(language);
    const nextProgress = makeProgress(nextRounds, 0, [false, false, false]);
    setRounds(nextRounds);
    setIndex(0);
    setPaused(false);
    setResetOpen(false);
    setStreak(0);
    await saveProgress(nextProgress);
  };

  const persistCurrentGame = () => saveProgress(makeProgress(rounds, index));
  const togglePause = () => {
    if (!paused) persistCurrentGame();
    setPaused((v) => !v);
  };
  const goHome = () => {
    persistCurrentGame();
    navigate("/menu", { replace: true });
  };

  if (!loaded || !heartsReady || !round) return <LoadingScreen fontClass={fontClass} />;

  if (hearts <= 0) {
    return (
      <NoHeartsScreen
        hearts={hearts}
        cooldownUntil={cooldownUntil}
        fontClass={fontClass}
        sizeClass={sizeClass}
        userId={user.id}
        gameKey="finalWordBuilder"
        isGlobalLock
        onHeartsRefilled={(updated) => {
          const game = updated?.progress?.finalWordBuilder;
          setHearts(game?.hearts ?? MAX_HEARTS);
          setCooldownUntil(game?.cooldownUntil ?? null);
          setUser(updated);
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-sky-50 via-violet-50 to-amber-50 px-2 py-2 sm:p-6 ${fontClass} ${sizeClass}`}>
      <audio ref={keySoundRef} src="/sounds/keys.mp3" preload="auto" />

      {showWarning && <GlobalLockWarningModal onClose={handleCloseWarning} t={t} />}


      <div className="mx-auto max-w-5xl">
        <GameContainer
          fontClass={fontClass}
          sizeClass={sizeClass}
          score={index}
          total={rounds.length}
          keys={keys}
          progress={(index / rounds.length) * 100}
          paused={paused}
          rewardsEarned={progress.rewardsEarned}
          onPauseToggle={togglePause}
          onHome={goHome}
          onReset={() => setResetOpen(true)}
        >
          <div className="mx-auto flex w-full max-w-md flex-col items-center gap-2 sm:gap-2.5">
            <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:gap-3">
              <HeartsDisplay hearts={hearts} heartAnimating={heartAnimating} maxHearts={maxHearts} />
              <XPBadge xp={xp} level={level} />
            </div>

            <div className="w-full">
              <KeyStreakBar keyStreak={streak} keyEveryN={KEY_EVERY_N} justEarned={keyEarned} soundOn={false} />
            </div>
          </div>

          <main className="mx-auto w-full max-w-md py-4 sm:py-6">
          <div className="mb-3 flex items-center justify-center gap-2 sm:mb-4">
  <span className="inline-block rounded-full bg-violet-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-violet-700 sm:text-[11px]">
    {t("finalWordBuilder.title")}
  </span>
<button
  type="button"
  onClick={() => setShowWarning(true)}
  className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-red-600 bg-red-500 text-xs font-black text-white shadow-md transition hover:scale-110 hover:bg-red-600 sm:h-7 sm:w-7 sm:text-sm"
  title={t("finalWordBuilder.warningTitle")}
  aria-label={t("finalWordBuilder.warningTitle")}
>
  !
</button>
</div>

<h1 className="mt-2 text-center text-sm font-black text-slate-900 xs:text-base sm:text-lg">
  {t("finalWordBuilder.changeOneLetter")}
</h1>

            <div className="text-center">
              <div className="mb-3 text-2xl xs:text-3xl sm:mb-4 sm:text-4xl">
                {answered ? answer?.emoji || "🎉" : startAnswer?.emoji || "🔤"}
              </div>
              <WordBoxes word={startWord} changeIndex={round.changeIndex} fontClass={fontClass} />
            </div>

            <p className="my-3 text-center text-[11px] font-bold text-violet-700 sm:my-4 sm:text-sm">
              ↓ {answered ? t("finalWordBuilder.youChangedOneLetter") : t("finalWordBuilder.changePurpleLetter")}
            </p>

            {answered && (
              <div className="mb-4 text-center">
                <WordBoxes word={newWord} changeIndex={round.changeIndex} changed fontClass={fontClass} />
                <h2 className="mt-3 text-xl font-black tracking-wide text-emerald-700 xs:text-2xl sm:text-3xl">
                  {newWord.toUpperCase()}
                </h2>
                <p className="mt-1 text-[11px] font-bold text-emerald-600 sm:text-sm">
                  {t("finalWordBuilder.realWord")}
                </p>
              </div>
            )}

            {!answered && (
              <>
                <div
                  className={`grid gap-1.5 sm:gap-3 ${
                    round.choices.length >= 5 ? "grid-cols-5" : round.choices.length === 4 ? "grid-cols-4" : "grid-cols-3"
                  }`}
                >
                  {round.choices.map((letter) => (
                    <LetterButton
                      key={letter}
                      letter={letter}
                      onChoose={chooseLetter}
                      disabled={paused || Boolean(wrongLetter) || letter === startLetter}
                      wrong={wrongLetter === letter}
                      isStart={letter === startLetter}
                      fontClass={fontClass}
                    />
                  ))}
                </div>
                <p
                  className={`mt-2 min-h-4 text-center text-[11px] font-bold sm:text-xs ${
                    wrongLetter ? "text-rose-600" : "text-transparent"
                  }`}
                  aria-live="polite"
                >
                  {wrongLetter ? t("finalWordBuilder.tryAnother") : " "}
                </p>
              </>
            )}

            {answered && (
              <AppButton type="button" onClick={nextRound} variant="indigo" className="mt-3 w-full rounded-2xl">
                {t("finalWordBuilder.next")} →
              </AppButton>
            )}

            <p className="mt-4 text-center text-[11px] font-bold text-slate-500 sm:text-xs">
              {t("finalWordBuilder.round")} <span className="text-violet-700">{index + 1}</span> / {rounds.length}
            </p>
          </main>
        </GameContainer>
      </div>

      <LevelUpToast level={level} show={leveledUp} />

      {resetOpen && (
        <ResetConfirmationModal
          onConfirm={resetGame}
          onCancel={() => setResetOpen(false)}
          cancelText={t("common.cancel")}
        />
      )}
    </div>
  );
}