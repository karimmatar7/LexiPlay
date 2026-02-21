import { useTranslation } from "react-i18next";


export default function LockedOverlay({ keyCost, onBuy, canAfford }) {
    const { t } = useTranslation();
  return (
    <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-0.5 z-10"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}>
      <span style={{ fontSize: "clamp(14px,3.5vw,20px)" }}>🔒</span>
      <span className="text-white font-black leading-none" style={{ fontSize: "clamp(8px,1.8vw,11px)" }}>
        🗝️ {keyCost}
      </span>
      <button
        onClick={onBuy}
        disabled={!canAfford}
        className={`mt-1 rounded-xl font-black text-white border-b-2 transition-all duration-150 active:scale-95
          ${canAfford
            ? "bg-yellow-400 border-yellow-600 hover:bg-yellow-300 hover:scale-105"
            : "bg-gray-400 border-gray-600 cursor-not-allowed opacity-70"
          }`}
        style={{ padding: "2px 7px", fontSize: "clamp(7px,1.5vw,10px)" }}
      >
        {canAfford ? t("avatar.shop.buy") : "💸"} 
      </button>
    </div>
  );
}
