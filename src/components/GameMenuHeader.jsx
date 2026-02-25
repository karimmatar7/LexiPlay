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
        @keyframes gmh-logo-glow {
          0%, 100% { box-shadow: 0 8px 32px rgba(251,191,36,0.4); }
          50% { box-shadow: 0 12px 48px rgba(251,191,36,0.6); }
        }
        @keyframes gmh-title-slide {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes gmh-avatar-rise {
          0% { opacity: 0; transform: translateY(12px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .gmh-avatar-wrapper {
          width: clamp(48px, 10vw, 72px);
          height: clamp(48px, 10vw, 72px);
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: 0 8px 24px rgba(99,102,241,0.3);
          transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
        }
        .gmh-avatar-wrapper:hover {
          transform: scale(1.1);
          box-shadow: 0 12px 32px rgba(99,102,241,0.5);
        }
        .gmh-avatar-wrapper svg {
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>

      <div className={`flex items-center justify-between px-6 py-6 gap-6 ${fontClass} ${sizeMap[fontSize]}`}>
        
        {/* LEFT: Logo + Title (professional split layout) */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* Logo */}
          <div 
            className="relative flex-shrink-0 p-3 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-2xl shadow-2xl border-4 border-white/80 animate-gmh-logo-glow"
            style={{ animationDuration: '3s', animationIterationCount: 'infinite' }}
          >
            <img
              src="/fox.png"
              alt="LexiPlay"
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-lg"
            />
          </div>
          
          {/* Title + Subtitle */}
          <div className="min-w-0 flex-1 animate-gmh-title-slide" style={{ animationDelay: '0.2s' }}>
            <h1 className="font-black text-2xl sm:text-3xl lg:text-4xl text-gray-900 leading-tight truncate" style={{ letterSpacing: '-0.025em' }}>
              {t("gameMenu.title")}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 font-medium mt-1 truncate">
              {t("gameMenu.subtitle", { name })}
            </p>
          </div>
        </div>

        {/* RIGHT: Avatar + Time (compact professional) */}
        <div className="flex items-center gap-4 flex-shrink-0">
          
          {/* Avatar */}
          {avatar ? (
            <button
              onClick={() => navigate("/avatar")}
              className="relative group p-1 -m-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/50"
              title={t("avatar.edit")}
              style={{ animation: 'gmh-avatar-rise 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.4s both' }}
            >
              <div className="gmh-avatar-wrapper bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-3 border-white/50 group-hover:border-indigo-400">
                <AvatarCanvas avatar={avatar} size={72} animated={false} fullBody={false} />
              </div>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white scale-0 group-hover:scale-100 transition-transform duration-200 origin-top-right">
                ✏
              </span>
            </button>
          ) : (
            <button
              onClick={() => navigate("/avatar")}
              className="group relative p-2 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/50"
              style={{ animation: 'gmh-avatar-rise 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.4s both' }}
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-100 to-purple-100 border-3 border-dashed border-indigo-300 rounded-full shadow-lg group-hover:bg-indigo-200 group-hover:border-indigo-400 transition-all duration-300 flex items-center justify-center group-hover:scale-105">
                <span className="text-2xl">🎨</span>
              </div>
            </button>
          )}

          {/* Time Display */}
          {children}
        </div>
      </div>
    </>
  )
}
