import React from "react";
import { createPortal } from "react-dom";
import WheelSpinButton from "./WheelSpinButton";
import keyIcon from "../../assets/icons/key.png";
import lockIcon from "../../assets/icons/lock.png";

const ANGLES = [-90, -18, 54, 126, 198];

function WheelGame({
  game,
  index,
  currentKeys,
  onSelect,
  lockedLabel,
  focused,
  isSpinning,
}) {
  const locked = !game.active;
  const required = game.keysRequired || 0;

  const progress = required
    ? Math.min(100, Math.round((currentKeys / required) * 100))
    : 0;

  return (
    <button
      type="button"
      disabled={locked || isSpinning}
      onClick={() => onSelect(game)}
      aria-label={
        locked && required
          ? `${game.title}, ${lockedLabel}, ${currentKeys}/${required}`
          : game.title
      }
      className={`game-wheel-item absolute left-1/2 top-1/2 z-20 flex w-[clamp(76px,22vw,100px)] flex-col items-center ${
        locked || isSpinning ? "cursor-not-allowed" : "cursor-pointer"
      } ${focused ? "game-wheel-item-focused z-30" : ""}`}
      style={{
        "--angle": `${ANGLES[index]}deg`,
        "--radius": "clamp(106px,29vw,135px)",
        animationDelay: `${0.08 + index * 0.06}s`,
      }}
    >
      <span
        className={`game-wheel-icon relative flex h-[clamp(58px,16vw,74px)] w-[clamp(58px,16vw,74px)] items-center justify-center rounded-[1.35rem] border-2 border-white/80 bg-gradient-to-br ${game.pickerColor} shadow-[0_10px_22px_rgba(15,23,42,0.3)] ${
          locked ? "brightness-[0.68] saturate-[0.45]" : ""
        } ${
          focused
            ? "ring-4 ring-amber-300 ring-offset-4 ring-offset-indigo-700"
            : ""
        }`}
      >
        <img
          src={game.icon}
          alt=""
          aria-hidden="true"
          draggable="false"
          className={`h-[clamp(29px,8vw,38px)] w-[clamp(29px,8vw,38px)] object-contain ${
            locked ? "opacity-75 grayscale-[0.35]" : ""
          }`}
        />

        {locked && (
          <>
            <span className="absolute inset-0 rounded-[1.2rem] bg-slate-950/20" />

            <span className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-700 shadow-md">
              <img
                src={lockIcon}
                alt=""
                aria-hidden="true"
                draggable="false"
                className="h-3.5 w-3.5 object-contain"
              />
            </span>
          </>
        )}
      </span>

      <span
        className={`mt-1.5 max-w-[106px] text-center text-[10px] font-extrabold leading-tight drop-shadow-[0_1px_2px_rgba(15,23,42,0.72)] ${
          locked ? "text-white/65" : "text-white"
        } ${focused ? "text-amber-200" : ""}`}
      >
        {game.title}
      </span>

      {locked && required > 0 && (
        <span className="mt-1 w-[clamp(70px,20vw,88px)] rounded-lg border border-white/25 bg-slate-950/30 px-1.5 py-1 shadow-sm">
          <span className="flex items-center justify-center gap-1 text-[8px] font-black text-white/90">
            <img
              src={keyIcon}
              alt=""
              aria-hidden="true"
              draggable="false"
              className="h-2.5 w-2.5 object-contain"
            />
            {currentKeys}/{required}
          </span>

          <span className="mt-1 block h-1 overflow-hidden rounded-full bg-white/20">
            <span
              className="block h-full rounded-full bg-amber-300"
              style={{ width: `${progress}%` }}
            />
          </span>
        </span>
      )}
    </button>
  );
}

export default function MobileGameWheel({
  open,
  games,
  currentKeys,
  onClose,
  onSelect,
  onSpin,
  focusedGameId,
  isSpinning,
  canSpin,
  labels,
}) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <>
      <style>{`
        @keyframes game-wheel-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes game-wheel-scale {
          from {
            opacity: 0;
            transform: scale(0.52) rotate(-10deg);
          }

          to {
            opacity: 1;
            transform: scale(1) rotate(0);
          }
        }

        @keyframes game-wheel-item {
          from {
            opacity: 0;
            transform:
              translate(-50%, -50%)
              rotate(var(--angle))
              translateX(calc(var(--radius) * 0.5))
              rotate(calc(-1 * var(--angle)))
              scale(0.25);
          }

          to {
            opacity: 1;
            transform:
              translate(-50%, -50%)
              rotate(var(--angle))
              translateX(var(--radius))
              rotate(calc(-1 * var(--angle)))
              scale(1);
          }
        }

        @keyframes game-wheel-selected {
          0%,
          100% {
            transform:
              translate(-50%, -50%)
              rotate(var(--angle))
              translateX(var(--radius))
              rotate(calc(-1 * var(--angle)))
              scale(1);
          }

          50% {
            transform:
              translate(-50%, -50%)
              rotate(var(--angle))
              translateX(var(--radius))
              rotate(calc(-1 * var(--angle)))
              scale(1.15);
          }
        }

        .game-wheel-backdrop {
          animation: game-wheel-fade 0.2s ease-out both;
        }

        .game-wheel {
          animation: game-wheel-scale 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .game-wheel-item {
          transform:
            translate(-50%, -50%)
            rotate(var(--angle))
            translateX(var(--radius))
            rotate(calc(-1 * var(--angle)));
          animation: game-wheel-item 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .game-wheel-item-focused {
          animation: game-wheel-selected 0.24s ease-in-out infinite !important;
        }

        .game-wheel-icon {
          transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease;
        }

        .game-wheel-item:not(:disabled):active .game-wheel-icon {
          transform: scale(0.9);
        }

        @media (prefers-reduced-motion: reduce) {
          .game-wheel-backdrop,
          .game-wheel,
          .game-wheel-item,
          .game-wheel-item-focused {
            animation: none !important;
          }
        }
      `}</style>

      <div
        role="dialog"
        aria-modal="true"
        aria-label={labels.title}
        className="game-wheel-backdrop fixed inset-0 z-[2147483647] flex items-center justify-center bg-slate-950/65 px-4 backdrop-blur-md md:hidden"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isSpinning}
          aria-label={labels.close}
          className="absolute inset-0 disabled:cursor-not-allowed"
        />

        <div className="relative z-10 flex w-full max-w-[410px] flex-col items-center">
          <h2 className="mb-4 text-center text-xl font-black tracking-wide text-white drop-shadow-[0_3px_8px_rgba(15,23,42,0.8)]">
            {labels.title}
          </h2>

          <div className="game-wheel relative h-[min(88vw,410px)] w-[min(88vw,410px)]">
            <div className="absolute inset-0 rounded-full border-[3px] border-white/50 bg-gradient-to-br from-indigo-500 via-violet-600 to-fuchsia-500 shadow-[0_28px_80px_rgba(49,46,129,0.55)]" />

            <div className="absolute inset-3 rounded-full border border-white/25 bg-slate-950/10" />

    <WheelSpinButton
  canSpin={canSpin}
  isSpinning={isSpinning}
  onSpin={onSpin}
  title={labels.title}
  spinLabel={labels.spin}
  spinningLabel={labels.spinning}
/>

            <button
              type="button"
              onClick={onClose}
              disabled={isSpinning}
              aria-label={labels.close}
              className="absolute -right-1 -top-1 z-40 flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-white/80 bg-white text-2xl font-black leading-none text-indigo-600 shadow-xl transition-transform duration-200 active:scale-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ×
            </button>

            {games.map((game, index) => (
              <WheelGame
                key={game.id}
                game={game}
                index={index}
                currentKeys={currentKeys}
                onSelect={onSelect}
                lockedLabel={labels.locked}
                focused={focusedGameId === game.id}
                isSpinning={isSpinning}
              />
            ))}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}