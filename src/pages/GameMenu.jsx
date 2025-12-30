import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import GameCard from "../components/GameCard";
import { getUser, updateParentalControl } from "../utils/user.js";

export default function GameMenu({ user }) {
  const { fontType, fontSize } = useSettings();
  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans";
  const sizeMap = { small: "text-base", medium: "text-lg", large: "text-xl" };
  const navigate = useNavigate();
  const location = useLocation();

  const [progress, setProgress] = useState(user?.progress || {});
  const [timeLeft, setTimeLeft] = useState(null);
  const [limitReached, setLimitReached] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const timerRef = useRef(null);
  const hasLoadedRef = useRef(false);
  const modalShownRef = useRef(false);
  const redirectHandledRef = useRef(false); // NEW


useEffect(() => {
  if (location.state?.limitReached && !redirectHandledRef.current) {
    setShowLimitModal(true);
    setLimitReached(true);
    modalShownRef.current = true;
    redirectHandledRef.current = true;
    
    // Immediately clear the navigation state
    navigate('/menu', { replace: true, state: {} });
  }
}, [location.state, navigate]);


  // Reset redirect handled flag when leaving and returning to menu
  useEffect(() => {
    return () => {
      redirectHandledRef.current = false;
    };
  }, []);

 // --- Load latest progress and parental control ---
useEffect(() => {
  async function loadProgress() {
    if (!user?.id) return; // Add this check
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const latestUser = await getUser(user.id);
    if (latestUser?.progress) setProgress(latestUser.progress);

    // --- Parental control / daily limit ---
    const pc = latestUser?.parental_control || {}; // Change to optional chaining
    
    // Only proceed if parental control is enabled
    if (!pc.enabled) {
      setTimeLeft(null);
      setLimitReached(false);
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    let playtimeToday = pc.playtimeToday || 0;
    const dailyLimitMinutes = pc.dailyLimitMinutes || 60;

    // reset if last played date is not today
    if (pc.lastPlayedDate !== today) {
      playtimeToday = 0;
      await updateParentalControl(user.id, { playtimeToday: 0, lastPlayedDate: today });
    }

    const remainingSeconds = Math.max(dailyLimitMinutes * 60 - playtimeToday, 0);
    setTimeLeft(remainingSeconds);

    if (remainingSeconds <= 0) {
      setLimitReached(true);
      if (!modalShownRef.current) {
        setShowLimitModal(true);
        modalShownRef.current = true;
      }
    } else {
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setLimitReached(true);
            if (!modalShownRef.current) {
              setShowLimitModal(true);
              modalShownRef.current = true;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }

  loadProgress();
  
  return () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };
}, [user?.id]); // Keep dependency on user?.id only


  const handleCloseModal = () => {
    setShowLimitModal(false);
    // Clear the timer when modal is closed
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // --- Determine unlock states ---
  const letterBuildUnlocked = progress?.wordMatch?.letterBuildUnlocked || false;
  const mazeUnlocked = progress?.letterBuild?.mazeUnlocked || false;
  const finalUnlocked = progress?.wordMaze?.finalWordBuilderUnlocked || false;
  const wordMazeUnlocked = mazeUnlocked;

  // If daily limit reached, override unlocks to false
  const displayLetterBuild = limitReached ? false : letterBuildUnlocked;
  const displayMaze = limitReached ? false : wordMazeUnlocked;
  const displayFinal = limitReached ? false : finalUnlocked;
  const displayWordMatch = limitReached ? false : true;

  return (
    <div className={`min-h-screen bg-sky-50 p-6 md:p-8 ${fontClass} ${sizeMap[fontSize]} relative`}>
      {/* Background shapes */}
      <div className="absolute top-8 left-8 w-32 h-32 bg-pink-200 rounded-full opacity-30" />
      <div className="absolute bottom-12 right-12 w-40 h-40 bg-yellow-200 rounded-full opacity-25" />

      <div className="relative max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="inline-block p-8 rounded-3xl bg-white shadow-lg border-4 border-yellow-300">
            <img src="/fox.png" alt="LexiPlay Logo" className="w-28 h-28 md:w-32 md:h-32 mx-auto" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-purple-700" style={{ letterSpacing: "-0.02em" }}>
            Spelletjes Menu
          </h1>
          <p className="text-2xl text-gray-700 font-medium">
            Welk avontuur kies jij vandaag? 🎮
          </p>
          {/* Countdown Timer */}
          {timeLeft !== null && !limitReached && (
            <div className="inline-block bg-white rounded-2xl px-6 py-3 shadow-lg border-3 border-orange-300">
              <p className="text-2xl text-orange-600 font-black">
                ⏰ Tijd over: <span className="text-red-600">{formatTime(timeLeft)}</span>
              </p>
            </div>
          )}
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <GameCard 
            icon="🧩" 
            title="Woord Match" 
            desc="Match woorden met geluiden en maak de juiste combinaties!" 
            active={displayWordMatch} 
            to={displayWordMatch ? "/game" : null} 
            unlockMsg={limitReached ? "Dagelijkse limiet bereikt" : null}
            bgColor="bg-green-100" 
            borderColor="border-green-400" 
          />
          <GameCard 
            icon="🔤" 
            title="Letter Bouw" 
            desc="Bouw woorden letter voor letter en wordt een spelling-kampioen!" 
            active={displayLetterBuild} 
            to={displayLetterBuild ? "/letterbuild" : null} 
            unlockMsg={limitReached ? "Dagelijkse limiet bereikt" : "Scoor 7 punten in Woord Match"} 
            bgColor="bg-blue-100" 
            borderColor="border-blue-400" 
          />
          <GameCard 
            icon="🌀" 
            title="Woorden Doolhof" 
            desc="Vind je weg door het doolhof door de juiste letters te kiezen!" 
            active={displayMaze} 
            to={displayMaze ? "/wordmaze" : null} 
            unlockMsg={limitReached ? "Dagelijkse limiet bereikt" : "Scoor 10 punten in Letter Bouw"} 
            bgColor="bg-purple-100" 
            borderColor="border-purple-400" 
          />
          <GameCard 
            icon="🏆" 
            title="Finale Woorden Bouw" 
            desc="Bouw woorden onder tijdsdruk en word een echte kampioen!" 
            active={displayFinal} 
            to={displayFinal ? "/finalwordbuilder" : null} 
            unlockMsg={limitReached ? "Dagelijkse limiet bereikt" : "Scoor 10 punten in Woorden Doolhof"} 
            bgColor="bg-pink-100" 
            borderColor="border-pink-400" 
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/settings" className="group inline-flex items-center justify-center gap-3 bg-indigo-500 hover:bg-indigo-600 text-white px-10 py-5 rounded-2xl text-lg font-bold shadow-md hover:shadow-lg border-b-4 border-indigo-700 transform hover:scale-105 transition-all duration-200">
            <span className="text-2xl">⚙️</span>
            <span>Instellingen</span>
          </Link>
        </div>
      </div>

      {/* Parental Control Floating Button */}
      <button 
        onClick={() => navigate("/unlock-parental")} 
        className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg border-2 border-purple-400 hover:bg-purple-700 hover:scale-110 transition-transform duration-200 z-50" 
        title="Ouderlijk Toezicht"
      >
        👨‍👩‍👧
      </button>

      {/* Limit Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-50 p-6">
          <div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-lg border-4 border-red-400">
            <div className="text-6xl mb-4">⏰</div>
            <h2 className="text-3xl font-bold text-red-600 mb-4">Dagelijkse limiet bereikt!</h2>
            <p className="text-lg text-gray-700 mb-6">
              Je hebt vandaag je maximale speeltijd bereikt. 🎉<br/>
              Alle spellen zijn nu vergrendeld, kom morgen terug voor een nieuwe speeltijd!
            </p>
            <button 
              onClick={handleCloseModal}
              className="px-8 py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-md hover:shadow-lg border-b-4 border-purple-800 transform hover:scale-105 transition-all"
            >
              Begrepen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
