import React, { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useSettings } from "../context/SettingsContext"
import AvatarCanvas from "../components/AvatarCanvas"
import { AVATAR_PARTS, DEFAULT_AVATAR, getLabel } from "../data/avatarParts"
import { supabase } from "../supaBaseClient"

const TABS = ["bg", "skin", "hair", "eyes", "mouth", "outfit", "accessory"]

export default function AvatarEditor({ user, setUser }) {
  const { t, i18n } = useTranslation()
  const { fontType } = useSettings()
  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans"
  const navigate = useNavigate()

  const [avatar, setAvatar] = useState(user?.avatar || DEFAULT_AVATAR)
  const [activeTab, setActiveTab] = useState("bg")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const select = useCallback((part, value) => {
    setAvatar(prev => ({ ...prev, [part]: value }))
    setSaved(false)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from("users")
        .update({ avatar })
        .eq("id", user.id)
        .select()
        .single()

      if (!error && data) {
        setUser(prev => ({ ...prev, avatar }))
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      }
    } catch (_) {}
    setSaving(false)
  }

  const currentOptions = AVATAR_PARTS[activeTab] || []

  return (
    <div
      className={`min-h-screen bg-sky-50 ${fontClass} relative overflow-hidden`}
      style={{ padding: "clamp(16px,4vw,32px)" }}
    >
      <style>{`
        @keyframes ae-fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ae-idle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-8px) rotate(1deg); }
        }
        @keyframes ae-saved {
          0%   { transform: scale(0.8); opacity: 0; }
          50%  { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ae-tab-in {
          from { opacity: 0; transform: translateY(10px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .ae-s1 { animation: ae-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.00s both; }
        .ae-s2 { animation: ae-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.08s both; }
        .ae-s3 { animation: ae-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.16s both; }
        .ae-s4 { animation: ae-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.24s both; }
        .ae-s5 { animation: ae-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.32s both; }
        .ae-grid-in { animation: ae-tab-in 0.3s cubic-bezier(0.22,1,0.36,1) both; }

        /* ── Avatar container: CSS owns all sizing ── */
        .ae-avatar-container {
          width: clamp(120px, 38vw, 190px);
          height: clamp(120px, 38vw, 190px);
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          animation: ae-idle 3.5s ease-in-out infinite;
          filter: drop-shadow(0 10px 18px rgba(0,0,0,0.13));
          /* ensure it stays centred on all screen sizes */
          margin-left: auto;
          margin-right: auto;
          display: block;
        }
        /* SVG always fills its container — no fixed pixel size */
        .ae-avatar-container svg {
          width: 100% !important;
          height: 100% !important;
          display: block;
        }

        /* ── Tab scrollbar ── */
        .ae-tabs::-webkit-scrollbar        { height: 5px; }
        .ae-tabs::-webkit-scrollbar-track  { background: transparent; }
        .ae-tabs::-webkit-scrollbar-thumb  { background: #c7d2fe; border-radius: 999px; }
        .ae-tabs::-webkit-scrollbar-thumb:hover { background: #818cf8; }
        @media (hover: none) {
          .ae-tabs::-webkit-scrollbar { display: none; }
          .ae-tabs { scrollbar-width: none; }
        }
      `}</style>

      {/* Blobs */}
      <div className="absolute pointer-events-none rounded-full" style={{ top:"-8%",left:"-8%", width:"clamp(160px,30vw,300px)", height:"clamp(160px,30vw,300px)", background:"radial-gradient(circle,rgba(251,207,232,0.5) 0%,transparent 70%)" }} />
      <div className="absolute pointer-events-none rounded-full" style={{ bottom:"-4%",right:"-6%", width:"clamp(180px,35vw,340px)", height:"clamp(180px,35vw,340px)", background:"radial-gradient(circle,rgba(254,240,138,0.4) 0%,transparent 70%)" }} />

      <div className="relative max-w-2xl mx-auto flex flex-col gap-5 z-10">

        {/* ── Top bar ──────────────────────────────────────────── */}
        <div className="ae-s1 flex items-center justify-between gap-2">
          <button
            onClick={() => navigate("/menu")}
            className="inline-flex items-center gap-2 bg-white border-2 border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 hover:scale-105 transition-all duration-200 shadow-sm flex-shrink-0"
            style={{ padding: "clamp(8px,2vw,12px) clamp(10px,2.5vw,18px)", fontSize: "clamp(12px,2.5vw,15px)" }}
          >
            {t("avatar.back")}
          </button>

          <h1
            className="font-black text-indigo-700 text-center leading-tight"
            style={{ fontSize: "clamp(16px,4vw,26px)" }}
          >
            {t("avatar.title")} 🎨
          </h1>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`inline-flex items-center gap-1.5 font-black rounded-2xl shadow-md border-b-4 transition-all duration-200 hover:scale-105 flex-shrink-0 ${
              saved
                ? "bg-green-400 border-green-600 text-white"
                : "bg-indigo-500 hover:bg-indigo-600 border-indigo-700 text-white"
            }`}
            style={{
              padding: "clamp(8px,2vw,12px) clamp(10px,2.5vw,18px)",
              fontSize: "clamp(12px,2.5vw,15px)",
              animation: saved ? "ae-saved 0.4s ease both" : "none",
            }}
          >
            {saving ? "💾…" : saved ? `✅ ${t("avatar.saved")}` : `💾 ${t("avatar.save")}`}
          </button>
        </div>

        {/* ── Avatar preview ───────────────────────────────────── */}
        {/*
          Wrapper centres the avatar circle horizontally.
          ae-avatar-container owns ALL sizing — SVG inside fills 100%.
          No JS window.innerWidth needed.
        */}
        <div className="ae-s2 flex flex-col items-center gap-3 w-full">
          <div className="ae-avatar-container">
            <AvatarCanvas avatar={avatar} size={190} animated={false} />
          </div>
          <p className="font-black text-indigo-600" style={{ fontSize: "clamp(14px,3vw,18px)" }}>
            {user?.name} 👋
          </p>
        </div>

        {/* ── Tab bar ──────────────────────────────────────────── */}
        <div className="ae-s3 ae-tabs flex gap-2 overflow-x-auto pb-2 w-full">
          {TABS.map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-shrink-0 font-bold rounded-2xl border-2 transition-all duration-200 hover:scale-105 ${
                activeTab === key
                  ? "bg-indigo-500 border-indigo-600 text-white shadow-md scale-105"
                  : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300"
              }`}
              style={{
                padding: "clamp(6px,1.5vw,10px) clamp(9px,2.2vw,15px)",
                fontSize: "clamp(11px,2vw,14px)",
              }}
            >
              {t(`avatar.tabs.${key}`)}
            </button>
          ))}
        </div>

        {/* ── Options grid ─────────────────────────────────────── */}
        <div
          key={activeTab}
          className="ae-s4 ae-grid-in bg-white border-2 border-indigo-100 rounded-3xl shadow-md w-full"
          style={{ padding: "clamp(12px,3vw,22px)" }}
        >
          {activeTab === "bg" ? (
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
              {currentOptions.map((opt) => {
                const isSelected = avatar.bg === opt.id
                return (
                  <button
                    key={opt.id}
                    onClick={() => select("bg", opt.id)}
                    title={getLabel(opt, i18n.language)}
                    className={`relative rounded-2xl border-4 transition-all duration-200 hover:scale-110 ${
                      isSelected
                        ? "border-indigo-500 scale-110 shadow-lg"
                        : "border-transparent hover:border-indigo-300"
                    }`}
                    style={{ background: opt.color, aspectRatio: "1 / 1" }}
                  >
                    {isSelected && (
                      <span
                        className="absolute inset-0 flex items-center justify-center text-white font-black drop-shadow"
                        style={{ fontSize: "clamp(14px,4vw,20px)" }}
                      >
                        ✓
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {currentOptions.map((opt) => {
                const isSelected = avatar[activeTab] === opt.id
                return (
                  <button
                    key={opt.id}
                    onClick={() => select(activeTab, opt.id)}
                    className={`flex flex-col items-center gap-1 rounded-2xl border-2 transition-all duration-200 hover:scale-105 ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-400 shadow-md scale-105"
                        : "bg-gray-50 border-gray-200 hover:border-indigo-200"
                    }`}
                    style={{ padding: "clamp(8px,2vw,14px) clamp(6px,1.5vw,10px)" }}
                  >
                    <span style={{ fontSize: "clamp(22px,5.5vw,34px)", lineHeight: 1 }}>
                      {opt.emoji}
                    </span>
                    <span
                      className={`font-bold leading-none text-center ${
                        isSelected ? "text-indigo-600" : "text-gray-500"
                      }`}
                      style={{ fontSize: "clamp(9px,1.8vw,12px)" }}
                    >
                      {getLabel(opt, i18n.language)}
                    </span>
                    {isSelected && (
                      <span className="text-indigo-400 font-black leading-none" style={{ fontSize: "clamp(8px,1.5vw,11px)" }}>
                        ✓
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Randomise ────────────────────────────────────────── */}
        <div className="ae-s5 flex justify-center pb-4">
          <button
            onClick={() => {
              const rand = (arr) => arr[Math.floor(Math.random() * arr.length)].id
              setAvatar({
                skin:      rand(AVATAR_PARTS.skin),
                eyes:      rand(AVATAR_PARTS.eyes),
                mouth:     rand(AVATAR_PARTS.mouth),
                hair:      rand(AVATAR_PARTS.hair),
                outfit:    rand(AVATAR_PARTS.outfit),
                accessory: rand(AVATAR_PARTS.accessory),
                bg:        rand(AVATAR_PARTS.bg),
              })
              setSaved(false)
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white font-black rounded-2xl shadow-md border-b-4 border-purple-700 hover:scale-105 transition-all duration-200"
            style={{
              padding: "clamp(10px,2.5vw,14px) clamp(20px,5vw,32px)",
              fontSize: "clamp(13px,2.5vw,16px)",
            }}
          >
            🎲 {t("avatar.randomise")}
          </button>
        </div>
      </div>
    </div>
  )
}
