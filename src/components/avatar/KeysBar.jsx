import { useTranslation } from "react-i18next";

export default function KeysBar({ keys }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center gap-2 bg-yellow-50 border-2 border-yellow-200 rounded-2xl px-4 py-2 w-fit mx-auto">
      <span className="text-lg">🗝️</span>
      <span className="font-black text-yellow-700" style={{ fontSize: "clamp(13px,2.5vw,16px)" }}>
        {keys} {t("avatar.shop.keys")}
      </span>
    </div>
  );
}
