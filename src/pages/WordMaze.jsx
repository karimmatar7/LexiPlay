import React, { useState, useEffect, useMemo } from "react";
import { useSettings } from "../context/SettingsContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import GameContainer from "../components/GameContainer";
import LoadingScreen from "../components/LoadingScreen";
import ResetConfirmationModal from "../components/ResetConfirmationModal";
import NoHeartsScreen from "../components/NoHeartsScreen";
import { HeartsDisplay } from "../components/HeartsDisplay";
import { useHearts } from "../hooks/useHearts";
import XPBadge from "../components/XPBadge";
import LevelUpToast from "../components/LevelUpToast";
import KeyStreakBar from "../components/KeyStreakBar";
import wordData from "../data/words.json";
import { updateProgress, addReward, addKeysAndXP, getUser } from "../supabaseFunctions.js";
import { calculateStars } from "../utils/progressStars";
import { emojiHints } from "../data/emojiHints";
import usePlaytimeTracker from "../hooks/usePlaytimeTracker";

const MAX_HEARTS  = 5;
const KEY_EVERY_N = 4;

const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

function buildLevels(wordsPerLevel) {
  const shuffled = shuffleArray(wordData);
  return Array.from(
    { length: Math.ceil(shuffled.length / wordsPerLevel) },
    (_, i) => shuffled.slice(i * wordsPerLevel, i * wordsPerLevel + wordsPerLevel)
  );
}

const generateMazeOptions = (word) => {
  const letters = word.split("");
  const options = letters.map((l) => [
    l,
    ...shuffleArray(
      "abcdefghijklmnopqrstuvwxyz".split("").filter((c) => c !== l)
    ).slice(0, 3),
  ]);
  return options.map((arr) => shuffleArray(arr));
};

const getRandomRevealedIndex = (wordLength) =>
  Math.floor(Math.random() * wordLength);

function MazeGameArea({
  currentWord, revealedLetterIndex, currentLetterIndex,
  options, handleLetterClick, t, fontClass, sizeClass,
}) {
  if (!currentWord) return null;

  return (
    <div className={`text-center ${fontClass} ${sizeClass}`}>
      <div className="mb-8 bg-white border-2 border-sky-300 rounded-2xl p-6 shadow-md">
        <div className="text-3xl md:text-5xl font-black tracking-wider text-sky-700 mb-4">
          {currentWord.displayWord
            .split("")
            .map((l, i) => {
              if (i === revealedLetterIndex) return l;
              if (i < currentLetterIndex && currentLetterIndex > revealedLetterIndex) return l;
              if (
                i < currentLetterIndex &&
                currentLetterIndex < revealedLetterIndex &&
                i < revealedLetterIndex
              ) return l;
              if (
                currentLetterIndex < revealedLetterIndex &&
                i > revealedLetterIndex &&
                i <= currentLetterIndex + currentWord.displayWord.length - revealedLetterIndex - 1
              ) return l;
              return "_";
            })
            .join(" ")}
        </div>

        <div className="text-5xl md:text-6xl mb-3">
          {emojiHints[currentWord.displayWord] || "❓"}
        </div>

        <p className="text-sm md:text-base text-gray-600 font-semibold">
          {t("mazeGame.clickLetter")}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(options[currentLetterIndex] || []).map((letter, idx) => (
          <button
            key={idx}
            onClick={() => letter && handleLetterClick(letter)}
            className="aspect-square bg-indigo-500 hover:bg-indigo-600 text-white font-black text-3xl md:text-4xl rounded-2xl shadow-md border-b-4 border-indigo-700 transform hover:scale-105 active:scale-95 transition-all duration-200"
          >
            {letter.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function WordMaze({ user, setUser, wordsPerLevel = 5 }) {
  usePlaytimeTracker(user);

  const { fontType, fontSize, soundOn } = useSettings();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans";
  const sizeMap = {
    small:  "text-base md:text-lg",
    medium: "text-lg md:text-xl",
    large:  "text-xl md:text-2xl",
  };
  const sizeClass = sizeMap[fontSize || "medium"];

  const [words,               setWords]               = useState(() => buildLevels(wordsPerLevel));
  const [mazeProgress,        setMazeProgress]        = useState({
    level: 0, levelIndex: 0, rewardsEarned: [false, false, false],
  });
  const [heartsInit,          setHeartsInit]          = useState(null);
  const [cooldownInit,        setCooldownInit]        = useState(null);
  const [revealedLetterIndex, setRevealedLetterIndex] = useState(0);
  const [currentLetterIndex,  setCurrentLetterIndex]  = useState(1);
  const [feedback,            setFeedback]            = useState("");
  const [paused,              setPaused]              = useState(false);
  const [showResetModal,      setShowResetModal]      = useState(false);
  const [loaded,              setLoaded]              = useState(false);
  const [justLeveledUp,       setJustLeveledUp]       = useState(false);
  const [keyStreak,           setKeyStreak]           = useState(0);   // ← NEW
  const [keyJustEarned,       setKeyJustEarned]       = useState(false); // ← NEW

  const { level, levelIndex, rewardsEarned } = mazeProgress;

  const xp      = user?.progress?.xp    || 0;
  const xpLevel = user?.progress?.level || 1;
  const keys    = user?.progress?.currency?.keys || 0;

  const getLocalizedWord = (wordObj) => {
    if (!wordObj) return "";
    if (i18n.language === "en") return wordObj.en;
    if (i18n.language === "fr") return wordObj.fr;
    return wordObj.correct;
  };

  const currentWordData = (words[level] || [])[levelIndex];
  const currentWord = currentWordData
    ? { ...currentWordData, displayWord: getLocalizedWord(currentWordData) }
    : null;

  const { hearts, cooldownUntil, heartAnimating, loseHeart, maxHearts, heartsReady } =
    useHearts({ user, gameKey: "wordMaze", initialHearts: heartsInit, initialCooldown: cooldownInit });

  const options = useMemo(
    () => (currentWord ? generateMazeOptions(currentWord.displayWord) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentWord?.displayWord]
  );

  useEffect(() => {
    const loadProgress = async () => {
      if (!user) return;
      const userData = await getUser(user.id);
      const progress = userData?.progress?.wordMaze || {};

      setWords(buildLevels(wordsPerLevel));
      setMazeProgress({
        level:         progress.level         || 0,
        levelIndex:    progress.levelIndex    || 0,
        rewardsEarned: progress.rewardsEarned || [false, false, false],
      });
      setHeartsInit(progress.hearts         ?? MAX_HEARTS);
      setCooldownInit(progress.cooldownUntil ?? null);

      const initialWordObj = wordData[
        (progress.level || 0) * wordsPerLevel + (progress.levelIndex || 0)
      ];
      if (initialWordObj) {
        const displayWord = getLocalizedWord(initialWordObj);
        const randomIndex = getRandomRevealedIndex(displayWord.length);
        setRevealedLetterIndex(randomIndex);
        setCurrentLetterIndex((randomIndex + 1) % displayWord.length);
      }

      setLoaded(true);
    };
    loadProgress();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, wordsPerLevel, i18n.language]);

  useEffect(() => {
    if (currentWord) {
      const randomIndex = getRandomRevealedIndex(currentWord.displayWord.length);
      setRevealedLetterIndex(randomIndex);
      setCurrentLetterIndex((randomIndex + 1) % currentWord.displayWord.length);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWord?.displayWord]);

  const saveProgress = async (progressData = mazeProgress) => {
    if (!user) return;
    const updated = await updateProgress(user.id, { wordMaze: progressData });
    if (updated) setUser((prev) => ({ ...prev, progress: updated.progress }));
  };

  const resetMaze = async () => {
    const freshLevels = buildLevels(wordsPerLevel);
    const newProgress = { level: 0, levelIndex: 0, rewardsEarned: [false, false, false] };
    setWords(freshLevels);
    setMazeProgress(newProgress);

    if (freshLevels.length > 0 && freshLevels[0].length > 0) {
      const displayWord = getLocalizedWord(freshLevels[0][0]);
      const randomIndex = getRandomRevealedIndex(displayWord.length);
      setRevealedLetterIndex(randomIndex);
      setCurrentLetterIndex((randomIndex + 1) % displayWord.length);
    }

    setFeedback("");
    setPaused(false);
    setShowResetModal(false);
    setKeyStreak(0);      // ← reset streak on game reset
    await saveProgress(newProgress);
  };

  const togglePause = () => setPaused((prev) => !prev);
  const goHome = async () => { await saveProgress(); navigate("/menu", { replace: true }); };

  const handleLetterClick = async (letter) => {
    if (paused || !currentWord) return;

    const targetLetter = currentWord.displayWord[currentLetterIndex];

    if (letter === targetLetter) {
      let nextIndex = (currentLetterIndex + 1) % currentWord.displayWord.length;
      if (nextIndex === revealedLetterIndex) {
        nextIndex = (nextIndex + 1) % currentWord.displayWord.length;
      }

      const revealedSet  = new Set([revealedLetterIndex]);
      const guessedCount = Array.from(
        { length: currentWord.displayWord.length }, (_, i) => i
      )
        .filter((i) => !revealedSet.has(i))
        .filter((i) => {
          if (revealedLetterIndex < currentLetterIndex) {
            return i <= currentLetterIndex && i !== revealedLetterIndex;
          } else {
            return i <= currentLetterIndex || i > revealedLetterIndex;
          }
        }).length;

      if (guessedCount === currentWord.displayWord.length - 1) {
        // ── Word complete: update key streak ─────────────────
        const newStreak = keyStreak + 1;
        const earnKey   = newStreak >= KEY_EVERY_N;

        const result = await addKeysAndXP(user.id, earnKey ? 1 : 0, 10);
        if (result) {
          setUser((prev) => ({ ...prev, progress: result.user.progress }));
          if (result.leveledUp) {
            setJustLeveledUp(true);
            setTimeout(() => setJustLeveledUp(false), 3000);
          }
        }

        if (earnKey) {
          setKeyStreak(0);
          setKeyJustEarned(true);
          setTimeout(() => setKeyJustEarned(false), 1500);
        } else {
          setKeyStreak(newStreak);
        }

        setMazeProgress((prev) => {
          const updated = { ...prev };
          setTimeout(() => nextWordOrLevel(updated), 1500);
          return updated;
        });
        setFeedback("correct");
      } else {
        setCurrentLetterIndex(nextIndex);
      }
    } else {
      setFeedback("incorrect");
      setKeyStreak(0);    // ← reset streak on wrong answer
      await loseHeart();
      setTimeout(() => setFeedback(""), 1000);
    }
  };

  const nextWordOrLevel = async (progress = mazeProgress) => {
    const currentLevelWords = words[progress.level] || [];
    let newProgress = { ...progress };

    if (progress.levelIndex + 1 < currentLevelWords.length) {
      newProgress.levelIndex += 1;
    } else if (progress.level + 1 < words.length) {
      newProgress.level    += 1;
      newProgress.levelIndex = 0;
    } else {
      const freshLevels = buildLevels(wordsPerLevel);
      setWords(freshLevels);
      newProgress = { level: 0, levelIndex: 0, rewardsEarned: [false, false, false] };
      setMazeProgress(newProgress);
      setFeedback("");
      return;
    }

    const totalWords      = words.flat().length;
    const currentPosition = newProgress.level * wordsPerLevel + newProgress.levelIndex + 1;
    const progressPercent = Math.min((currentPosition / totalWords) * 100, 100);

    await checkAndAwardStars(newProgress, progressPercent);
    setMazeProgress(newProgress);
    setFeedback("");
  };

  const checkAndAwardStars = async (newProgress, progressPercent) => {
    const starsEarned = calculateStars(progressPercent);
    const rewards     = newProgress.rewardsEarned || [false, false, false];
    let rewardsAdded  = 0;

    for (let i = 0; i < starsEarned; i++) {
      if (!rewards[i]) { rewards[i] = true; rewardsAdded++; }
    }

    newProgress.rewardsEarned = rewards;
    await updateProgress(user.id, { wordMaze: newProgress });

    if (rewardsAdded > 0) {
      await addReward(user.id, rewardsAdded);
      setUser((prev) => ({
        ...prev,
        rewards: (prev.rewards || 0) + rewardsAdded,
        progress: { ...prev.progress, wordMaze: newProgress },
      }));
    }
  };

  if (!loaded || !heartsReady)
    return <LoadingScreen fontClass={fontClass} sizeMap={sizeMap} />;
  if (!currentWord)
    return <LoadingScreen fontClass={fontClass} sizeMap={sizeMap} />;
  if (hearts <= 0)
    return <NoHeartsScreen hearts={hearts} cooldownUntil={cooldownUntil} fontClass={fontClass} sizeClass={sizeClass} />;

  const totalWords      = words.flat().length;
  const currentPosition = level * wordsPerLevel + levelIndex + 1;
  const displayProgress = (currentPosition / totalWords) * 100;

  return (
    <>
      <GameContainer
        fontClass={fontClass}
        sizeClass={sizeClass}
        bgColor="bg-sky-50"
        bgVariant="default"
        score={currentPosition - 1}
        total={totalWords}
        keys={keys}
        paused={paused}
        rewardsEarned={rewardsEarned}
        progress={displayProgress}
        feedback={feedback}
        onPauseToggle={togglePause}
        onHome={goHome}
        onReset={() => setShowResetModal(true)}
      >
        <HeartsDisplay hearts={hearts} heartAnimating={heartAnimating} maxHearts={maxHearts} />
        <XPBadge xp={xp} level={xpLevel} />

        {/* ── KeyStreakBar ── */}
        <KeyStreakBar
          keyStreak={keyStreak}
          keyEveryN={KEY_EVERY_N}
          justEarned={keyJustEarned}
          soundOn={soundOn}
        />

        <MazeGameArea
          currentWord={currentWord}
          revealedLetterIndex={revealedLetterIndex}
          currentLetterIndex={currentLetterIndex}
          options={options}
          handleLetterClick={handleLetterClick}
          t={t}
          fontClass={fontClass}
          sizeClass={sizeClass}
        />
      </GameContainer>

      <LevelUpToast level={xpLevel} show={justLeveledUp} />

      {showResetModal && (
        <ResetConfirmationModal
          onCancel={() => setShowResetModal(false)}
          onConfirm={resetMaze}
        />
      )}
    </>
  );
}
