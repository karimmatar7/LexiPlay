import { useTranslation } from "react-i18next";
import LockedOverlay from "./LockedOverlay";

export default function AvatarOptionButton({ opt, part, isSelected, isUnlocked, canAfford, onSelect, onBuyClick }) {
  const { i18n } = useTranslation();
  const label = opt.label?.[i18n.language] || opt.label?.en || opt.id;

  return (
    <button
      onClick={() => isUnlocked ? onSelect(part, opt.id) : onBuyClick(opt)}
      className={`relative flex flex-col items-center gap-1 rounded-2xl border-2 transition-all duration-200 hover:scale-105
        ${isSelected
          ? "bg-indigo-50 border-indigo-400 shadow-md scale-105"
          : "bg-gray-50 border-gray-200 hover:border-indigo-200"
        }
        ${!isUnlocked ? "opacity-90" : ""}
      `}
      style={{ padding: "clamp(8px,2vw,14px) clamp(6px,1.5vw,10px)" }}
    >
      {/* Lock overlay */}
      {!isUnlocked && (
        <LockedOverlay
          keyCost={opt.keyCost}
          canAfford={canAfford}
          onBuy={(e) => { e.stopPropagation(); onBuyClick(opt); }}
        />
      )}

      <span style={{ fontSize: "clamp(22px,5.5vw,34px)", lineHeight: 1 }}>{opt.emoji}</span>
      <span
        className={`font-bold leading-none text-center ${isSelected ? "text-indigo-600" : "text-gray-500"}`}
        style={{ fontSize: "clamp(9px,1.8vw,12px)" }}
      >
        {label}
      </span>
      {isSelected && (
        <span className="text-indigo-400 font-black leading-none" style={{ fontSize: "clamp(8px,1.5vw,11px)" }}>✓</span>
      )}
    </button>
  );
}
