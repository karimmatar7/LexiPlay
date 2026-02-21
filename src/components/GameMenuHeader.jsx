import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import AvatarCanvas from "./AvatarCanvas"
import { DEFAULT_AVATAR } from "../data/avatarParts"

export default function GameMenuHeader({ fontClass, sizeMap, fontSize, children, name, avatar }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <>
      <style>{`
        @keyframes gmh-logo-float {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50%       { transform: translateY(-8px) rotate(2deg); }
        }
        @keyframes gmh-shine {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        @keyframes gmh-title-pop {
          0%   { opacity: 0; transform: scale(0.85) translateY(12px); }
          70%  { transform: scale(1.04) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes gmh-subtitle-fade {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gmh-avatar-pop {
          0%   { opacity: 0; transform: scale(0.7) rotate(-8deg); }
          70%  { transform: scale(1.08) rotate(3deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes gmh-avatar-idle {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-5px); }
        }
        @keyframes gmh-ring-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes gmh-dash-create {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Avatar wrapper — fluid square using aspect-ratio */
        .gmh-avatar-wrapper {
          position: relative;
          /* fluid: 13vw clamped between 52px and 96px */
          width: clamp(52px, 13vw, 96px);
          height: clamp(52px, 13vw, 96px);
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
        }
        /* SVG inside always fills the wrapper 100% */
        .gmh-avatar-wrapper svg {
          display: block;
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>

      <div className="text-center flex flex-col items-center gap-4 md:gap-5">

        {/* ── Logo + Avatar row ──────────────────────────────────── */}
        <div className="flex items-center justify-center gap-4 md:gap-6">

          {/* Logo */}
          <div
            className="relative overflow-hidden rounded-3xl bg-white shadow-lg border-4 border-yellow-300 flex-shrink-0"
            style={{
              padding: "clamp(12px,3vw,20px)",
              animation: "gmh-logo-float 4s ease-in-out infinite",
            }}
          >
            <div
              className="absolute top-0 bottom-0 pointer-events-none"
              style={{
                width: "40%",
                background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)",
                animation: "gmh-shine 3s ease-in-out 1s infinite",
              }}
            />
            <img
              src="/fox.png"
              alt="LexiPlay Logo"
              className="relative z-10 block"
              style={{
                width: "clamp(52px,12vw,100px)",
                height: "clamp(52px,12vw,100px)",
                objectFit: "contain",
              }}
            />
          </div>

          {/* ── Avatar: has one ─────────────────────────────────── */}
          {avatar && (
            <button
              onClick={() => navigate("/avatar")}
              className="relative group flex flex-col items-center gap-1 focus:outline-none flex-shrink-0"
              style={{ animation: "gmh-avatar-pop 0.55s cubic-bezier(0.22,1,0.36,1) 0.2s both" }}
              title={t("avatar.edit") || "Edit avatar"}
            >
              {/* Idle float wrapper */}
              <div style={{ animation: "gmh-avatar-idle 3.5s ease-in-out infinite" }}>
                {/* Spinning dashed ring — only visible on hover */}
                <div
                  className="absolute rounded-full border-4 border-dashed border-indigo-300 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    inset: -7,
                    animation: "gmh-ring-spin 4s linear infinite",
                  }}
                />

                {/* Avatar circle */}
                <div
                  className="gmh-avatar-wrapper border-4 border-white group-hover:border-indigo-300 shadow-lg transition-all duration-200 group-hover:scale-110"
                >
                  <AvatarCanvas avatar={avatar} size={96} animated={false} fullBody={false} />
                </div>

                {/* Edit pencil badge */}
                <span
                  className="absolute -bottom-1 -right-1 bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-200 pointer-events-none"
                  style={{ width: "clamp(18px,4vw,24px)", height: "clamp(18px,4vw,24px)", fontSize: "clamp(9px,2vw,12px)" }}
                >
                  ✏️
                </span>
              </div>

              {/* Label */}
              <span
                className="font-bold text-indigo-400 group-hover:text-indigo-600 transition-colors duration-200 leading-none"
                style={{ fontSize: "clamp(9px,1.8vw,12px)", marginTop: 4 }}
              >
                {t("avatar.edit") || "Edit"}
              </span>
            </button>
          )}

          {/* ── Avatar: none yet ────────────────────────────────── */}
          {!avatar && (
            <button
              onClick={() => navigate("/avatar")}
              className="group flex flex-col items-center gap-1 focus:outline-none flex-shrink-0"
              style={{ animation: "gmh-avatar-pop 0.55s cubic-bezier(0.22,1,0.36,1) 0.2s both" }}
            >
              <div
                className="relative flex items-center justify-center rounded-full border-4 border-dashed border-indigo-200 group-hover:border-indigo-400 bg-indigo-50 group-hover:bg-indigo-100 transition-all duration-200 group-hover:scale-110 shadow-sm"
                style={{
                  width: "clamp(52px,13vw,96px)",
                  height: "clamp(52px,13vw,96px)",
                  animation: "gmh-dash-create 12s linear infinite",
                }}
              >
                <span style={{ fontSize: "clamp(22px,5vw,36px)" }}>🎨</span>
              </div>
              <span
                className="font-bold text-indigo-300 group-hover:text-indigo-500 transition-colors duration-200 leading-none"
                style={{ fontSize: "clamp(9px,1.8vw,12px)", marginTop: 4 }}
              >
                {t("avatar.create") || "Create!"}
              </span>
            </button>
          )}
        </div>

        {/* ── Title ─────────────────────────────────────────────── */}
        <h1
          className="font-black text-purple-700 leading-none"
          style={{
            fontSize: "clamp(26px,6.5vw,56px)",
            letterSpacing: "-0.02em",
            animation: "gmh-title-pop 0.6s cubic-bezier(0.22,1,0.36,1) 0.05s both",
          }}
        >
          {t("gameMenu.title")}
        </h1>

        {/* ── Subtitle ──────────────────────────────────────────── */}
        <p
          className="text-gray-600 font-semibold"
          style={{
            fontSize: "clamp(13px,2.8vw,22px)",
            animation: "gmh-subtitle-fade 0.5s ease-out 0.2s both",
          }}
        >
          {t("gameMenu.subtitle", { name })}
        </p>

        {children}
      </div>
    </>
  )
}
