import React from "react";
import GameCard from "./GameCard";

export default function RandomGameCard({
  icon,
  title,
  desc,
  currentKeys,
  isRandomizing,
  onRandomize,
}) {
  return (
    <GameCard
      icon={icon}
      title={title}
      desc={desc}
      active
      to={null}
      bgColor="bg-indigo-100"
      borderColor="border-indigo-400"
      currentKeys={currentKeys}
      canAfford
      purchased
      globallyLocked={false}
      isUnlocking={isRandomizing}
      onUnlock={onRandomize}
      unlockMsg={undefined}
      isRandomFocused={false}
      isRandomizing={isRandomizing}
    />
  );
}