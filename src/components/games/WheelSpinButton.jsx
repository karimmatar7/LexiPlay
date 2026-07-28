import React from "react";

export default function WheelSpinButton({
  canSpin,
  isSpinning,
  onSpin,
  title,
  spinLabel,
  spinningLabel,
}) {
  if (!canSpin) {
    return (
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex h-[clamp(108px,30vw,126px)] w-[clamp(108px,30vw,126px)] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white/75 bg-white/95 px-4 text-center shadow-[0_16px_32px_rgba(30,27,75,0.28)]">
        <span className="text-xs font-black uppercase leading-tight tracking-[0.13em] text-indigo-600">
          {title}
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onSpin}
      disabled={isSpinning}
      className="absolute left-1/2 top-1/2 z-20 flex h-[clamp(108px,30vw,126px)] w-[clamp(108px,30vw,126px)] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-4 border-white/75 bg-white/95 px-4 text-center shadow-[0_16px_32px_rgba(30,27,75,0.28)] transition-transform duration-200 active:scale-95 disabled:cursor-wait"
    >
      <span className="text-xs font-black uppercase leading-tight tracking-[0.13em] text-indigo-600">
        {isSpinning ? spinningLabel : spinLabel}
      </span>

      <span
        className={`mt-2 h-2.5 w-2.5 rounded-full bg-fuchsia-500 ${
          isSpinning ? "animate-ping" : ""
        }`}
      />
    </button>
  );
}