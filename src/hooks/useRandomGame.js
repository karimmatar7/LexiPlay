import { useCallback, useEffect, useRef, useState } from "react";

export default function useRandomGame({ playableGames, navigate, onFinish }) {
  const [randomFocusId, setRandomFocusId] = useState(null);
  const [isRandomizing, setIsRandomizing] = useState(false);

  const intervalRef = useRef(null);
  const shuffleTimeoutRef = useRef(null);
  const navigateTimeoutRef = useRef(null);

  const clearRandomTimers = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (shuffleTimeoutRef.current) {
      window.clearTimeout(shuffleTimeoutRef.current);
      shuffleTimeoutRef.current = null;
    }

    if (navigateTimeoutRef.current) {
      window.clearTimeout(navigateTimeoutRef.current);
      navigateTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return clearRandomTimers;
  }, [clearRandomTimers]);

  const canRandomize = playableGames.length >= 2;

  const startRandomGame = useCallback(() => {
    if (isRandomizing || !canRandomize) return;

    clearRandomTimers();
    setIsRandomizing(true);

    const finalGame =
      playableGames[Math.floor(Math.random() * playableGames.length)];

    const reducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const finishGame = () => {
      setRandomFocusId(null);
      setIsRandomizing(false);
      onFinish?.();
      navigate(finalGame.to);
    };

    if (reducedMotion) {
      setRandomFocusId(finalGame.id);

      navigateTimeoutRef.current = window.setTimeout(finishGame, 700);
      return;
    }

    let previousId = "";

    intervalRef.current = window.setInterval(() => {
      const alternatives = playableGames.filter(
        (game) => game.id !== previousId
      );

      const nextGame =
        alternatives[Math.floor(Math.random() * alternatives.length)] ||
        finalGame;

      previousId = nextGame.id;
      setRandomFocusId(nextGame.id);
    }, 180);

    shuffleTimeoutRef.current = window.setTimeout(() => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      setRandomFocusId(finalGame.id);

      navigateTimeoutRef.current = window.setTimeout(finishGame, 900);
    }, 5000);
  }, [
    canRandomize,
    clearRandomTimers,
    isRandomizing,
    navigate,
    onFinish,
    playableGames,
  ]);

  return {
    canRandomize,
    isRandomizing,
    randomFocusId,
    startRandomGame,
    clearRandomTimers,
  };
}