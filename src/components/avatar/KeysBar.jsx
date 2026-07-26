import { useTranslation } from "react-i18next";
import keyIcon from "../../assets/icons/key.png";

export default function KeysBar({ keys }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center gap-2 bg-yellow-50 border-2 border-yellow-200 rounded-2xl px-4 py-2 w-fit mx-auto">
      <img src={keyIcon} alt="Key" className="h-5 w-5" />
      <span className="font-black text-yellow-700" style={{ fontSize: "clamp(13px,2.5vw,16px)" }}>
        {keys} {t("avatar.shop.keys")}
      </span>
    </div>
  );
}
