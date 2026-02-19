import React from "react";
import HeaderBar from "./HeaderBar";
import ProgressBar from "./ProgressBar";
import PauseOverlay from "./PauseOverlay";
import FeedbackModal from "./FeedbackModal";
import BackgroundDecoration from "./BackgroundDecoration";

export default function GameContainer({
  fontClass,
  sizeClass,
  bgColor = "bg-sky-50",
  bgVariant = "default",
  score,
  keys = 0,
  total,
  paused,
  rewardsEarned,
  progress,
  feedback,
  onPauseToggle,
  onHome,
  onReset,
  children
}) {
  return (
    <div className={`min-h-screen ${bgColor} p-4 md:p-6 ${fontClass} ${sizeClass} relative`}>
      <BackgroundDecoration variant={bgVariant} />
      
      <div className="relative max-w-5xl mx-auto">
        <HeaderBar
          keys={keys}           // ← add this
          score={score}
          total={total}
          paused={paused}
          rewardsEarned={rewardsEarned}
          onPauseToggle={onPauseToggle}
          onHome={onHome}
          onReset={onReset}
        />
        
        <ProgressBar progress={progress} />
        
        <div className="bg-white rounded-3xl border-3 border-blue-200 shadow-lg p-6 md:p-10 lg:p-12">
          {paused ? <PauseOverlay /> : children}
        </div>
        
        <FeedbackModal 
          type={feedback === "correct" ? "correct" : feedback === "incorrect" ? "incorrect" : ""} 
        />
      </div>
    </div>
  );
}
