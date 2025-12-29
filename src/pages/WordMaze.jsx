import React, { useState, useEffect } from "react";
import { useSettings } from "../context/SettingsContext";
import { useNavigate } from "react-router-dom";
import GameContainer from "../components/GameContainer";
import LoadingScreen from "../components/LoadingScreen";
import LevelCompleteScreen from "../components/LevelCompleteScreen";
import VictoryScreen from "../components/VictoryScreen";
import ResetConfirmationModal from "../components/ResetConfirmationModal";
import UnlockModal from "../components/UnlockModal";
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


const getRandomRevealedIndex = (wordLength) => {
  return Math.floor(Math.random() * wordLength);
};


// --- Game Area Component ---
function MazeGameArea({
  currentWord,
  revealedLetterIndex,
  currentLetterIndex,
  options,
  handleLetterClick
}) {
  if (!currentWord) return null;


  return (
    <div className="text-center">
      <div className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-2xl p-6 shadow-sm">
        <div className="text-3xl md:text-5xl font-black tracking-wider text-purple-700 mb-4">
          {currentWord.correct.split("").map((l, i) => {
            if (i === revealedLetterIndex) return l;
            if (i < currentLetterIndex && currentLetterIndex > revealedLetterIndex) return l;
            if (i < currentLetterIndex && currentLetterIndex < revealedLetterIndex && i < revealedLetterIndex) return l;
            if (currentLetterIndex < revealedLetterIndex && i > revealedLetterIndex && i <= currentLetterIndex + currentWord.correct.length - revealedLetterIndex - 1) return l;
            return "_";
          }).join(" ")}
        </div>
        <div className="text-5xl md:text-6xl mb-2">{emojiHints[currentWord.correct] || "❓"}</div>
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
  );
}


// --- Main Component ---
export default function WordMaze({ user, setUser, wordsPerLevel = 5 }) {
  const { fontType, fontSize } = useSettings();
  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans";
  const sizeMap = { small: "text-base md:text-lg", medium: "text-lg md:text-xl", large: "text-xl md:text-2xl" };
  const navigate = useNavigate();


  const [words, setWords] = useState([]);
  const [mazeProgress, setMazeProgress] = useState({
    level: 0,
    levelIndex: 0,
    score: 0,
    rewardsEarned: [false, false, false],
    finalWordBuilderUnlocked: false
  });
  const [revealedLetterIndex, setRevealedLetterIndex] = useState(0);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(1);
  const [feedback, setFeedback] = useState("");
  const [paused, setPaused] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [starEarned, setStarEarned] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);


  const { level, levelIndex, score, rewardsEarned, finalWordBuilderUnlocked } = mazeProgress;
  const currentWord = (words[level] || [])[levelIndex];


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
        { length: Math.ceil(wordData.length / wordsPerLevel) },
        (_, i) => wordData.slice(i * wordsPerLevel, i * wordsPerLevel + wordsPerLevel)
      );
      setWords(levels);


      setMazeProgress({
        level: progress.level || 0,
        levelIndex: progress.levelIndex || 0,
        score: progress.score || 0,
        rewardsEarned: progress.rewardsEarned || [false, false, false],
        finalWordBuilderUnlocked: progress.finalWordBuilderUnlocked || false
      });
     
      const initialWord = levels[progress.level || 0][progress.levelIndex || 0];
      if (initialWord) {
        const randomIndex = getRandomRevealedIndex(initialWord.correct.length);
        setRevealedLetterIndex(randomIndex);
        setCurrentLetterIndex((randomIndex + 1) % initialWord.correct.length);
      }
     
      setLoaded(true);
    };
    loadProgress();
  }, [user, wordsPerLevel]);


  // Update revealed letter when word changes
  useEffect(() => {
    if (currentWord) {
      const randomIndex = getRandomRevealedIndex(currentWord.correct.length);
      setRevealedLetterIndex(randomIndex);
      setCurrentLetterIndex((randomIndex + 1) % currentWord.correct.length);
    }
  }, [currentWord?.correct]);


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
  // Keep unlocks intact
  const newProgress = {
    ...mazeProgress, // keep finalWordBuilderUnlocked and rewardsEarned
    level: 0,
    levelIndex: 0,
    score: 0
  };
  setMazeProgress(newProgress);

  // Reset first word indices
  if (words.length > 0 && words[0].length > 0) {
    const firstWord = words[0][0];
    const randomIndex = getRandomRevealedIndex(firstWord.correct.length);
    setRevealedLetterIndex(randomIndex);
    setCurrentLetterIndex((randomIndex + 1) % firstWord.correct.length);
  }

  setFeedback("");
  setPaused(false);
  setShowResetModal(false);
  setStarEarned(false);

  // Save progress with only score/level reset
  await saveProgress(newProgress);
};



  const togglePause = () => setPaused(prev => !prev);
  const goHome = async () => { await saveProgress(); navigate("/menu"); };


  // --- Letter handling ---
  const handleLetterClick = (letter) => {
    if (paused) return;


    const targetLetter = currentWord.correct[currentLetterIndex];
    if (letter === targetLetter) {
      let nextIndex = (currentLetterIndex + 1) % currentWord.correct.length;
     
      if (nextIndex === revealedLetterIndex) {
        nextIndex = (nextIndex + 1) % currentWord.correct.length;
      }
     
      const revealedSet = new Set([revealedLetterIndex]);
      const guessedCount = Array.from({length: currentWord.correct.length}, (_, i) => i)
        .filter(i => !revealedSet.has(i))
        .filter(i => {
          if (revealedLetterIndex < currentLetterIndex) {
            return i <= currentLetterIndex && i !== revealedLetterIndex;
          } else {
            return (i <= currentLetterIndex || i > revealedLetterIndex);
          }
        }).length;
     
      if (guessedCount === currentWord.correct.length - 1) {
        setMazeProgress(prev => {
          const updated = { ...prev, score: prev.score + 1 };
          setTimeout(() => nextWordOrLevel(updated), 1500);
          return updated;
        });
        setFeedback("correct");
      } else {
        setCurrentLetterIndex(nextIndex);
      }
    } else {
      setFeedback("incorrect");
      setTimeout(() => setFeedback(""), 1000);
    }
  };


  // --- Next word / next level with reward calculation ---
  const nextWordOrLevel = async (progress = mazeProgress) => {
    const currentLevelWords = words[progress.level] || [];
    let newProgress = { ...progress };


    if (progress.levelIndex + 1 < currentLevelWords.length) {
      newProgress.levelIndex += 1;
    } else if (progress.level + 1 < words.length) {
      newProgress.level += 1;
      newProgress.levelIndex = 0;
    } else {
      newProgress.rewardsEarned = [true, true, true];
      setMazeProgress(newProgress);
      setFeedback("victory");
      return;
    }


    const totalWords = words.flat().length;
    const currentPosition = newProgress.level * wordsPerLevel + newProgress.levelIndex + 1;
    const progressPercent = Math.min((currentPosition / totalWords) * 100, 100);


    await checkAndAwardStars(newProgress, progressPercent);
   
    setMazeProgress(newProgress);
    setFeedback("");
  };


  // --- Reward & Unlock logic ---
  const checkAndAwardStars = async (newProgress, progressPercent) => {
    const starsEarned = calculateStars(progressPercent);
    const rewards = newProgress.rewardsEarned || [false, false, false];
    let rewardsAdded = 0;


    for (let i = 0; i < starsEarned; i++) {
      if (!rewards[i]) {
        rewards[i] = true;
        rewardsAdded += 1;
      }
    }


    newProgress.rewardsEarned = rewards;


    // --- Check unlock BEFORE saving progress ---
    const shouldUnlock = newProgress.score >= 10 && !newProgress.finalWordBuilderUnlocked;
   
    if (shouldUnlock) {
      newProgress.finalWordBuilderUnlocked = true;
    }


    // --- Save progress ---
    await updateProgress(user.id, { wordMaze: newProgress });


    // --- Add rewards if any ---
    if (rewardsAdded > 0) {
      setStarEarned(true);
      await addReward(user.id, rewardsAdded);
      setUser(prev => ({
        ...prev,
        rewards: (prev.rewards || 0) + rewardsAdded,
        progress: { ...prev.progress, wordMaze: newProgress }
      }));
    }


    // --- Set unlock modal AFTER all state updates ---
    if (shouldUnlock) {
      setShowUnlockModal(true);
    }
  };


  const goToNextLevel = async () => {
    setStarEarned(false);
    setFeedback("");
    await saveProgress();
  };


  // --- RENDER ORDER: This is critical! ---
  // Check conditions in priority order using early returns
  if (!loaded) return <LoadingScreen fontClass={fontClass} sizeMap={sizeMap} />;


  // Check unlock modal FIRST, before star screen
  if (showUnlockModal) {
    return (
      <UnlockModal
        fontClass={fontClass}
        sizeClass={sizeMap[fontSize || "medium"]}
        gameName="Finale Woord Bouw"
        gameEmoji="🔤"
        gameRoute="/finalwordbuilder"
        onClose={() => {
          setShowUnlockModal(false);
          setStarEarned(false);
          setFeedback("");
        }}
      />
    );
  }


  if (starEarned) {
    return (
      <LevelCompleteScreen
        nextLevel={goToNextLevel}
        fontClass={fontClass}
        sizeMap={sizeMap}
      />
    );
  }


  if (feedback === "victory") {
    return <VictoryScreen fontClass={fontClass} sizeMap={sizeMap} score={score} words={words} onRestart={resetMaze} />;
  }


  // --- Normal game render ---
  const options = currentWord ? generateMazeOptions(currentWord.correct) : [];


  const totalWords = words.flat().length;
  const currentPosition = level * wordsPerLevel + levelIndex + 1;
  const displayProgress = (currentPosition / totalWords) * 100;


  return (
    <>
      <GameContainer
        fontClass={fontClass}
        sizeClass={sizeMap[fontSize || "medium"]}
        bgColor="bg-purple-50"
        bgVariant="purple"
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
        <MazeGameArea
          currentWord={currentWord}
          revealedLetterIndex={revealedLetterIndex}
          currentLetterIndex={currentLetterIndex}
          options={options}
          handleLetterClick={handleLetterClick}
        />
      </GameContainer>


      {showResetModal && (
        <ResetConfirmationModal
          onCancel={() => setShowResetModal(false)}
          onConfirm={resetMaze}
        />
      )}
    </>
  );
}
