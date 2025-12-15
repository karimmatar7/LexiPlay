import React, { useState, useEffect } from "react";
import { useSettings } from "../context/SettingsContext";
import { useNavigate } from "react-router-dom";
import GameContainer from "../components/GameContainer";
import AudioButton from "../components/AudioButton";
import LoadingScreen from "../components/LoadingScreen";
import LevelCompleteScreen from "../components/LevelCompleteScreen";
import VictoryScreen from "../components/VictoryScreen";
import UnlockModal from "../components/UnlockModal";
import ResetConfirmationModal from "../components/ResetConfirmationModal";
import wordData from "../data/words.json";
import { updateProgress, addReward } from "../supabaseFunctions.js";
import { supabase } from "../supaBaseClient";
import { calculateStars } from "../utils/progressStars";

// --- Helpers ---
const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

const generateOptions = (correctWord, allWords) => {
  const targetLength = correctWord.length;
  const distractors = shuffleArray(
    allWords.map(w => w.correct).filter(w => w !== correctWord && Math.abs(w.length - targetLength) <= 1)
  ).slice(0, 3);

  while (distractors.length < 3) {
    const random = allWords[Math.floor(Math.random() * allWords.length)].correct;
    if (random !== correctWord && !distractors.includes(random)) distractors.push(random);
  }

  return shuffleArray([correctWord, ...distractors]);
};

// --- Main Component ---
export default function WordMatch({ user, setUser, wordsPerLevel = 7 }) {
  const { fontType, fontSize, soundOn } = useSettings();
  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans";
  const sizeMap = { small: "text-base md:text-lg", medium: "text-lg md:text-xl", large: "text-xl md:text-2xl" };
  const navigate = useNavigate();

  const [levels, setLevels] = useState([]);
  const [progress, setProgress] = useState({
    level: 0,
    levelIndex: 0,
    score: 0,
    letterBuildUnlocked: false,
    rewardsEarned: [false, false, false]
  });
  const [feedback, setFeedback] = useState("");
  const [answered, setAnswered] = useState(false);
  const [paused, setPaused] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [starEarned, setStarEarned] = useState(false);

  const { level, levelIndex, rewardsEarned } = progress;

  // --- Load progress ---
  useEffect(() => {
    const loadProgress = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      const userProgress = data.progress?.wordMatch || {};
      const levelsArr = Array.from(
        { length: Math.ceil(wordData.length / wordsPerLevel) },
        (_, i) => wordData.slice(i * wordsPerLevel, i * wordsPerLevel + wordsPerLevel)
      );

      setLevels(levelsArr);

      setProgress({
        level: userProgress.level || 0,
        levelIndex: userProgress.levelIndex || 0,
        score: userProgress.score || 0,
        letterBuildUnlocked: userProgress.letterBuildUnlocked || false,
        rewardsEarned: userProgress.rewardsEarned || [false, false, false]
      });

      setLoaded(true);
    };

    loadProgress();
  }, [user, wordsPerLevel]);

  // --- Save progress ---
  const saveProgress = async (newProgress = progress) => {
    if (!user) return;
    const updated = await updateProgress(user.id, { wordMatch: newProgress });
    if (updated) {
      setUser(prev => ({ ...prev, progress: updated.progress }));
    }
  };

  // --- Reset progress ---
  const resetScore = async () => {
    const newProgress = {
      ...progress,
      score: 0,
      level: 0,
      levelIndex: 0,
      rewardsEarned: [false, false, false]
    };
    setProgress(newProgress);
    setFeedback("");
    setAnswered(false);
    setPaused(false);
    setShowResetModal(false);
    setStarEarned(false);
    await saveProgress(newProgress);
  };

  const togglePause = async () => {
    setPaused(prev => !prev);
    if (!paused) await saveProgress();
  };

  const goHome = async () => {
    await saveProgress();
    navigate("/menu");
  };

  const currentWord = (levels[level] || [])[levelIndex];

  const handleAnswer = (opt) => {
    if (answered || paused) return;
    setAnswered(true);

    if (opt === currentWord.correct) {
      setFeedback("correct");
      setProgress(prev => {
        const updated = { ...prev, score: prev.score + 1 };
        setTimeout(() => nextWordOrLevel(updated), 1500);
        return updated;
      });
    } else {
      setFeedback("incorrect");
      setTimeout(() => { setFeedback(""); setAnswered(false); }, 1500);
    }
  };

  const nextWordOrLevel = async (newProgress = progress) => {
    const currentLevelWords = levels[newProgress.level] || [];
    let updatedProgress = { ...newProgress };

    if (updatedProgress.levelIndex + 1 < currentLevelWords.length) {
      updatedProgress.levelIndex += 1;
    } else if (updatedProgress.level + 1 < levels.length) {
      updatedProgress.level += 1;
      updatedProgress.levelIndex = 0;
      if (updatedProgress.level === 1 && !updatedProgress.letterBuildUnlocked) {
        updatedProgress.letterBuildUnlocked = true;
        setShowUnlockModal(true);
      }
    } else {
      updatedProgress.rewardsEarned = [true, true, true];
      setFeedback("victory");
    }

    const totalWords = levels.flat().length;
    const currentPosition = updatedProgress.level * wordsPerLevel + updatedProgress.levelIndex + 1;
    const progressPercent = Math.min((currentPosition / totalWords) * 100, 100);
    await checkAndAwardStars(updatedProgress, progressPercent);

    setProgress(updatedProgress);
    setFeedback(updatedProgress.rewardsEarned.some((r, i) => !progress.rewardsEarned[i] && r) ? "star" : "");
    setAnswered(false);
  };

  const checkAndAwardStars = async (updatedProgress, progressPercent) => {
    const starsEarned = calculateStars(progressPercent);
    const rewards = updatedProgress.rewardsEarned || [false, false, false];
    let rewardsAdded = 0;

    for (let i = 0; i < starsEarned; i++) {
      if (!rewards[i]) {
        rewards[i] = true;
        rewardsAdded += 1;
      }
    }

    updatedProgress.rewardsEarned = rewards;

    if (rewardsAdded > 0) {
      setStarEarned(true);
      await addReward(user.id, rewardsAdded);
      setUser(prev => ({
        ...prev,
        rewards: (prev.rewards || 0) + rewardsAdded,
        progress: { ...prev.progress, wordMatch: updatedProgress }
      }));
    }

    await updateProgress(user.id, { wordMatch: updatedProgress });
  };

  const goToNextLevel = async () => {
    setStarEarned(false);
    setProgress(prev => ({ ...prev, level: prev.level + 1, levelIndex: 0 }));
    setFeedback("");
    setAnswered(false);
    await saveProgress();
  };

  if (!loaded) return <LoadingScreen fontClass={fontClass} sizeMap={sizeMap} />;

  if (showUnlockModal)
    return (
      <UnlockModal
        fontClass={fontClass}
        sizeClass={sizeMap[fontSize || "medium"]}
        gameName="Letter Bouw"
        gameEmoji="🔤"
        gameRoute="/letterbuild"
        onClose={async () => {
          setShowUnlockModal(false);
          setFeedback("");
          setAnswered(false);
          await saveProgress();
        }}
      />
    );

  if (starEarned)
    return <LevelCompleteScreen fontClass={fontClass} sizeMap={sizeMap} nextLevel={goToNextLevel} />;

  if (feedback === "victory")
    return <VictoryScreen fontClass={fontClass} sizeMap={sizeMap} score={progress.score} words={levels} onRestart={resetScore} />;

  const totalWords = levels.flat().length;
  const currentPosition = level * wordsPerLevel + levelIndex + 1;
  const displayProgress = (currentPosition / totalWords) * 100;

  return (
    <>
      <GameContainer
        fontClass={fontClass}
        sizeClass={sizeMap[fontSize || "medium"]}
        bgColor="bg-sky-50"
        bgVariant="default"
        score={currentPosition - 1}
        total={totalWords}
        paused={paused}
        rewardsEarned={rewardsEarned}
        progress={displayProgress}
        feedback={feedback}
        onPauseToggle={togglePause}
        onHome={goHome}
        onReset={() => setShowResetModal(true)}
      >
        <WordOptions 
          currentWord={currentWord} 
          answered={answered} 
          soundOn={soundOn}
          paused={paused}
          handleAnswer={handleAnswer} 
        />
      </GameContainer>

      {showResetModal && <ResetConfirmationModal onCancel={() => setShowResetModal(false)} onConfirm={resetScore} />}
    </>
  );
}

const WordOptions = ({ currentWord, answered, soundOn, paused, handleAnswer }) => {
  if (!currentWord) return null;
  const options = generateOptions(currentWord.correct, wordData);

  return (
    <>
      <div className="mb-8 md:mb-12">
        <AudioButton
          word={currentWord.sound}
          soundOn={soundOn}
          paused={paused}
          label="Speel het woord af"
          className="w-full text-2xl md:text-3xl py-6 md:py-8"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {options.map((opt, i) => (
          <button
            key={i}
            disabled={answered}
            onClick={() => handleAnswer(opt)}
            className={`py-6 md:py-8 px-4 rounded-2xl font-bold text-xl md:text-2xl transition-all duration-200 ${
              answered
                ? "opacity-50 cursor-not-allowed bg-gray-200 border-3 border-gray-400"
                : "bg-gradient-to-br from-purple-50 to-pink-50 border-3 border-purple-400 hover:border-purple-500 hover:bg-gradient-to-br hover:from-purple-100 hover:to-pink-100 shadow-md hover:shadow-lg transform hover:scale-105"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </>
  );
};
