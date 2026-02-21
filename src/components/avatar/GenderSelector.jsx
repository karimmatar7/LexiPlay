import { useTranslation } from "react-i18next";

const GENDERS = [
  { id: "male",   emoji: "👦", labelKey: "avatar.gender.male"   },
  { id: "female", emoji: "👧", labelKey: "avatar.gender.female" },
]

export default function GenderSelector({ value, onChange }) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-center gap-3">
      {GENDERS.map((g) => (
        <button
          key={g.id}
          onClick={() => onChange(g.id)}
          className={`flex items-center gap-2 font-black rounded-2xl border-2 px-4 py-2 transition-all duration-200 hover:scale-105
            ${value === g.id
              ? "bg-indigo-500 border-indigo-600 text-white shadow-md scale-105"
              : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300"
            }`}
          style={{ fontSize: "clamp(12px,2.5vw,15px)" }}
        >
          <span style={{ fontSize: "clamp(18px,4vw,24px)" }}>{g.emoji}</span>
          {t(g.labelKey)}
        </button>
      ))}
    </div>
  )
}
