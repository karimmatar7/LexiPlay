import React, { useState, useEffect } from "react";
import { useSettings } from "../context/SettingsContext";
import { useNavigate } from "react-router-dom";
import HeaderBar from "../components/HeaderBar";
import ProgressBar from "../components/ProgressBar";
import FeedbackModal from "../components/FeedbackModal";
import PauseOverlay from "../components/PauseOverlay";
import LoadingScreen from "../components/LoadingScreen";
import VictoryScreen from "../components/VictoryScreen";
import ResetConfirmationModal from "../components/ResetConfirmationModal";
import wordData from "../data/words.json";
import { updateProgress, addReward } from "../supabaseFunctions.js";
import { supabase } from "../supaBaseClient";
import { calculateStars } from "../utils/progressStars";
import { emojiHints } from "../data/emojiHints";

// --- Helpers ---
const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

const generateMazeOptions = (word) => {
  const letters = word.split("");
  const options = letters.map((l) => [
    l,
    ...shuffleArray("abcdefghijklmnopqrstuvwxyz".split("").filter(c => c !== l)).slice(0, 3)
  ]);
  return options.map(arr => shuffleArray(arr));
};

// --- Main Component ---
export default function WordMaze({ user, setUser }) {
  const { fontType, fontSize } = useSettings();
  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans";
  const sizeMap = { small: "text-base md:text-lg", medium: "text-lg md:text-xl", large: "text-xl md:text-2xl" };
  const WORDS_PER_LEVEL = 5;
  const navigate = useNavigate();

  const [words, setWords] = useState([]);
  const [mazeProgress, setMazeProgress] = useState({
    level: 0,
    levelIndex: 0,
    score: 0,
    rewardsEarned: [false, false, false]
  });
  const [currentLetterIndex, setCurrentLetterIndex] = useState(1);
  const [feedback, setFeedback] = useState("");
  const [paused, setPaused] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const { level, levelIndex, score, rewardsEarned } = mazeProgress;
  const currentWord = (words[level] || [])[levelIndex];
  const currentEmojiHint = emojiHints[currentWord?.correct] || "❓";

  // --- Load progress ---
  useEffect(() => {
    const loadProgress = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) return console.error(error);

      const progress = data.progress?.wordMaze || {};
      const levels = Array.from(
        { length: Math.ceil(wordData.length / WORDS_PER_LEVEL) },
        (_, i) => wordData.slice(i * WORDS_PER_LEVEL, i * WORDS_PER_LEVEL + WORDS_PER_LEVEL)
      );
      setWords(levels);

      setMazeProgress({
        level: progress.level || 0,
        levelIndex: progress.levelIndex || 0,
        score: progress.score || 0,
        rewardsEarned: progress.rewardsEarned || [false, false, false]
      });
      setCurrentLetterIndex(1);
      setLoaded(true);
    };
    loadProgress();
  }, [user]);

  // --- Save progress ---
  const saveProgress = async (progressData = mazeProgress) => {
    if (!user) return;
    const updated = await updateProgress(user.id, { wordMaze: progressData });
    if (updated) {
      user.progress = updated.progress;
      setUser(prev => ({ ...prev, progress: updated.progress }));
    }
  };

  // --- Reset handler ---
  const resetMaze = async () => {
    const newProgress = { level: 0, levelIndex: 0, score: 0, rewardsEarned: [false, false, false] };
    setMazeProgress(newProgress);
    setCurrentLetterIndex(1);
    setFeedback("");
    setPaused(false);
    setShowResetModal(false);
    await saveProgress(newProgress);
  };

  const togglePause = () => setPaused(prev => !prev);
  const goHome = async () => { await saveProgress(); navigate("/menu"); };

  // --- Letter handling ---
  const handleLetterClick = (letter) => {
    if (paused) return;

    const targetLetter = currentWord.correct[currentLetterIndex];
    if (letter === targetLetter) {
      if (currentLetterIndex + 1 === currentWord.correct.length) {
        // Word complete
        setMazeProgress(prev => {
          const updated = { ...prev, score: prev.score + 1 };
          nextWordOrLevel(updated);
          return updated;
        });
        setFeedback("correct");
      } else {
        setCurrentLetterIndex(prev => prev + 1);
      }
    } else {
      setFeedback("incorrect");
      setTimeout(() => setFeedback(""), 1000);
    }
  };

  // --- Next word / next level with reward calculation ---
  const nextWordOrLevel = async (progress = mazeProgress) => {
    setCurrentLetterIndex(1);
    setFeedback("");

    const currentLevelWords = words[level] || [];
    let newProgress = { ...progress };

    // Next word in level
    if (levelIndex + 1 < currentLevelWords.length) {
      newProgress.levelIndex += 1;

    // Next level
    } else if (level + 1 < words.length) {
      newProgress.level += 1;
      newProgress.levelIndex = 0;

    // Victory
    } else {
      newProgress.rewardsEarned = [true, true, true];
      setFeedback("victory");
    }

    // --- Calculate stars and award rewards ---
    const totalWords = words.flat().length;
    const currentPosition = newProgress.level * WORDS_PER_LEVEL + newProgress.levelIndex + 1;
    const progressPercent = (currentPosition / totalWords) * 100;

    await checkAndAwardStars(newProgress, progressPercent, totalWords);
    setMazeProgress(newProgress);
  };

  const checkAndAwardStars = async (progressData, progressPercent, totalWords) => {
    const starsEarned = calculateStars(progressPercent);
    const rewards = progressData.rewardsEarned || [false, false, false];
    let rewardsAdded = 0;

    for (let i = 0; i < starsEarned; i++) {
      if (!rewards[i]) {
        rewards[i] = true;
        rewardsAdded += 1;
      }
    }

    progressData.rewardsEarned = rewards;
    await updateProgress(user.id, { wordMaze: progressData });

    if (rewardsAdded > 0) {
      await addReward(user.id, rewardsAdded);
      setUser(prev => ({
        ...prev,
        rewards: (prev.rewards || 0) + rewardsAdded,
        progress: { ...prev.progress, wordMaze: progressData }
      }));
    }
  };

  if (!loaded) return <LoadingScreen fontClass={fontClass} sizeMap={sizeMap} />;
  if (feedback === "victory") return <VictoryScreen fontClass={fontClass} sizeMap={sizeMap} score={score} words={words} onRestart={resetMaze} />;

  const options = currentWord ? generateMazeOptions(currentWord.correct) : [];

  const displayProgress = words.length
    ? ((levelIndex + 1 + level * WORDS_PER_LEVEL) / words.flat().length) * 100
    : 0;

  return (
    <div className={`min-h-screen bg-purple-50 p-4 md:p-6 ${fontClass} ${sizeMap[fontSize || "medium"]} relative`}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-40 h-40 bg-purple-200 rounded-full opacity-30" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-pink-200 rounded-full opacity-25" />
      </div>

      <div className="relative max-w-3xl mx-auto">
        <HeaderBar
          score={score}
          total={words.flat().length}
          paused={paused}
          rewardsEarned={rewardsEarned}
          onPauseToggle={togglePause}
          onHome={goHome}
          onReset={() => setShowResetModal(true)}
        />
        <ProgressBar progress={displayProgress} />

        <div className="bg-white rounded-3xl border-3 border-purple-200 shadow-lg p-6 md:p-10">
          {paused ? <PauseOverlay /> : (
            <div className="text-center">
              <div className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-2xl p-6 shadow-sm">
                <div className="text-3xl md:text-5xl font-black tracking-wider text-purple-700 mb-4">
                  {currentWord?.correct.split("").map((l, i) => 
                    i === 0 ? l : i < currentLetterIndex ? l : "_"
                  ).join(" ")}
                </div>
                <div className="text-5xl md:text-6xl mb-2">{emojiHints[currentWord?.correct] || "❓"}</div>
                <p className="text-sm md:text-base text-gray-600 font-medium">
                  Klik op de juiste letter!
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                {(options[currentLetterIndex] || []).map((letter, idx) => (
                  <button
                    key={idx}
                    onClick={() => letter && handleLetterClick(letter)}
                    className="aspect-square bg-gradient-to-br from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white font-black text-3xl md:text-4xl rounded-2xl shadow-md border-b-4 border-rose-600 hover:shadow-lg transform hover:scale-110 transition-all duration-200 active:scale-95"
                  >
                    {letter.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <FeedbackModal type={feedback === "correct" ? "correct" : feedback === "incorrect" ? "incorrect" : ""} />
      </div>

      {showResetModal &&
        <ResetConfirmationModal
          onCancel={() => setShowResetModal(false)}
          onConfirm={resetMaze}
        />
      }
    </div>
  );
}
