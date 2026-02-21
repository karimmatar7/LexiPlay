import { useTranslation } from "react-i18next";

export default function BuyConfirmModal({ item, onConfirm, onCancel, currentKeys }) {
  const { t, i18n } = useTranslation();
  const label = item?.label?.[i18n.language] || item?.label?.en || item?.id;
  const canAfford = currentKeys >= item?.keyCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-3xl border-2 border-yellow-300 shadow-2xl p-6 max-w-xs w-full text-center space-y-4"
        style={{ animation: "ae-saved 0.3s ease both" }}>

        <div style={{ fontSize: "clamp(36px,10vw,52px)" }}>{item?.emoji}</div>

        <div>
          <h2 className="font-black text-gray-800" style={{ fontSize: "clamp(15px,3.5vw,20px)" }}>
            {label}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {t("avatar.shop.cost")}: <span className="font-black text-yellow-500">🗝️ {item?.keyCost}</span>
          </p>
          <p className={`text-sm font-semibold mt-0.5 ${canAfford ? "text-emerald-600" : "text-rose-500"}`}>
            {t("avatar.shop.yourKeys")}: 🗝️ {currentKeys}
            {!canAfford && ` · ${t("avatar.shop.notEnough")}`}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl py-2.5 border-2 border-gray-200 transition-all"
          >
            {t("avatar.shop.cancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={!canAfford}
            className={`flex-1 font-black rounded-2xl py-2.5 border-b-4 transition-all
              ${canAfford
                ? "bg-yellow-400 hover:bg-yellow-300 border-yellow-600 text-white hover:scale-105"
                : "bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed"
              }`}
          >
            {canAfford ? `🗝️ ${t("avatar.shop.buy")}` : t("avatar.shop.notEnough")}
          </button>
        </div>
      </div>
    </div>
  );
}
