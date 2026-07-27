import React from "react";

export default function MobileGameLauncher({ games, onOpen, labels }) {
  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        className="group relative w-full overflow-hidden rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-violet-100 px-4 py-4 text-left shadow-[0_12px_28px_rgba(79,70,229,0.14)] transition-all duration-200 active:scale-[0.98]"
      >
        <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-fuchsia-200/50 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-sky-200/60 blur-2xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center -space-x-2">
            {games.map((game, index) => (
              <span
                key={game.id}
                style={{ zIndex: games.length - index }}
                className={`flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-white bg-white shadow-md ${
                  !game.active ? "opacity-55 grayscale-[0.35]" : ""
                }`}
              >
                <img
                  src={game.icon}
                  alt=""
                  aria-hidden="true"
                  draggable="false"
                  className="h-6 w-6 object-contain"
                />
              </span>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-extrabold text-slate-800">
                {labels.title}
              </p>
              <p className="text-[11px] font-bold text-indigo-500">
                {labels.subtitle}
              </p>
            </div>

            <span
              aria-hidden="true"
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500 text-base font-black text-white shadow-md transition-transform duration-200 group-active:scale-90"
            >
              ▶
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}