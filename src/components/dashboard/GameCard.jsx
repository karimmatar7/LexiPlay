import React from "react";
import { formatDistanceToNow } from "date-fns";
import { heartStatus } from "../../utils/heartStatus.js";
import heartIcon from "../../assets/icons/heart.png";

const MAX_HEARTS = 5;

const GAME_META = {
  letterBuild:      { emoji: "🔤", border: "border-indigo-200", bg: "bg-indigo-50"  },
  wordMaze:         { emoji: "🌀", border: "border-sky-200",    bg: "bg-sky-50"     },
  wordMatch:        { emoji: "🃏", border: "border-pink-200",   bg: "bg-pink-50"    },
  finalWordBuilder: { emoji: "🏗️", border: "border-amber-200", bg: "bg-amber-50"   },
};

function HeartsRow({ count = 5, max = MAX_HEARTS }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <img
          key={i}
          src={heartIcon}
          alt=""
          aria-hidden="true"
          draggable="false"
          className={`h-4 w-4 object-contain transition-opacity sm:h-5 sm:w-5 ${
            i < count ? "opacity-100" : "opacity-15 grayscale"
          }`}
        />
      ))}
    </div>
  );
}

export default function GameCard({ gameKey, data, t }) {
  const meta = GAME_META[gameKey] || { emoji: "🎮", border: "border-gray-200", bg: "bg-gray-50" };
  const hs   = heartStatus(data);

  return (
    <div className={`rounded-2xl border-2 ${meta.border} ${meta.bg} p-4 sm:p-5 flex flex-col gap-3`}>

      <div className="flex items-center gap-2">
        <span className="text-2xl">{meta.emoji}</span>
        <h3 className="font-bold text-gray-800 text-sm sm:text-base leading-tight">
          {t(`gameCards.${gameKey}.title`)}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-medium mb-1">{t("parentDashboard.level")}</p>
          <p className="text-xl font-black text-[#7E22CE]">{data?.level ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-medium mb-1">{t("parentDashboard.wordNumber")}</p>
          <p className="text-xl font-black text-[#7E22CE]">{(data?.levelIndex ?? 0) + 1}</p>
        </div>
      </div>

      {hs && (
        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 font-medium">{t("parentDashboard.hearts")}</span>
            <HeartsRow count={hs.hearts} max={MAX_HEARTS} />
          </div>
          {hs.isRefilling ? (
            <p className="text-xs text-rose-500 font-medium">
              ⏳ {t("parentDashboard.refilling")} · {formatDistanceToNow(hs.fullRefillAt, { addSuffix: true })}
            </p>
          ) : hs.outOfHearts ? (
            <p className="text-xs text-rose-500 font-medium">
              💔 {t("parentDashboard.outOfHearts")}
            </p>
          ) : (
            <p className="text-xs text-emerald-600 font-medium">
              ✅ {t("parentDashboard.heartsReady")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
