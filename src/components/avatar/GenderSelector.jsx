import { useTranslation } from "react-i18next";
import boyIcon from "../../assets/icons/boy.png";
import girlIcon from "../../assets/icons/girl.png";

const GENDERS = [
  { id: "male", image: boyIcon, labelKey: "avatar.gender.male" },
  { id: "female", image: girlIcon, labelKey: "avatar.gender.female" },
];

export default function GenderSelector({ value, onChange }) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center gap-3">
      {GENDERS.map((g) => (
        <button
          key={g.id}
          type="button"
          onClick={() => onChange(g.id)}
          className={`flex items-center gap-2 font-black rounded-2xl border-2 px-4 py-2 transition-all duration-200 hover:scale-105
            ${
              value === g.id
                ? "bg-indigo-500 border-indigo-600 text-white shadow-md scale-105"
                : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300"
            }`}
          style={{ fontSize: "clamp(12px, 2.5vw, 15px)" }}
        >
          <img
            src={g.image}
            alt=""
            aria-hidden="true"
            draggable="false"
            className="shrink-0 object-contain"
            style={{
              width: "clamp(18px, 4vw, 24px)",
              height: "clamp(18px, 4vw, 24px)",
            }}
          />

          <span>{t(g.labelKey)}</span>
        </button>
      ))}
    </div>
  );
}