import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSettings } from "../context/SettingsContext";
import AvatarCanvas from "../components/AvatarCanvas";
import { AVATAR_PARTS, DEFAULT_AVATAR, getLabel } from "../data/avatarParts";
import { supabase } from "../supaBaseClient";
import { useAvatarShop } from "../hooks/useAvatarShop";
import AppButton from "../components/AppButton";
import AvatarOptionButton from "../components/avatar/AvatarOptionButton";
import BuyConfirmModal    from "../components/avatar/BuyConfirmModal";
import KeysBar            from "../components/avatar/KeysBar";
import GenderSelector     from "../components/avatar/GenderSelector";
import diceIcon from "../assets/icons/dice.png";
import paletteIcon from "../assets/icons/art.png";
import checkIcon from "../assets/icons/check.png";
import saveIcon from "../assets/icons/save.png";
import wavingIcon from "../assets/icons/waving.png";

const TABS = ["bg", "skin", "hair", "eyes", "mouth", "outfit", "accessory"];

export default function AvatarEditor({ user, setUser }) {
  const { t, i18n } = useTranslation();
  const { fontType }  = useSettings();
  const fontClass     = fontType === "dyslexic" ? "font-dyslexic" : "font-sans";
  const navigate      = useNavigate();

  const [avatar,    setAvatar]    = useState({ gender: "male", ...DEFAULT_AVATAR, ...(user?.avatar || {}) });
  const [activeTab, setActiveTab] = useState("bg");
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);

  const {
    pendingItem, currentKeys,
    openBuyModal, closeBuyModal, confirmPurchase,
  } = useAvatarShop({ user, setUser });

  const select = useCallback((part, value) => {
    setAvatar(prev => ({ ...prev, [part]: value }));
    setSaved(false);
  }, []);

  const handleGenderChange = useCallback((g) => {
    setAvatar(prev => ({ ...prev, gender: g }));
    setSaved(false);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .update({ avatar })
        .eq("id", user.id)
        .select()
        .single();
      if (!error && data) {
        setUser(prev => ({ ...prev, avatar }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (_) {}
    setSaving(false);
  };

  const currentOptions = AVATAR_PARTS[activeTab] || [];

  const itemUnlocked = (opt) => {
    if (!opt.locked) return true;
    return user?.progress?.avatar?.unlocked?.[activeTab]?.[opt.id] === true;
  };

  const isOutfitTab = activeTab === "outfit";

  return (
    <div className={`min-h-screen bg-gradient-to-b from-sky-50 via-sky-50 to-indigo-50 ${fontClass} relative overflow-hidden`}
      style={{ padding: "clamp(16px,4vw,32px)" }}>

      <style>{`
        @keyframes ae-fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ae-idle { 0%,100%{transform:translateY(0px) rotate(0deg)} 50%{transform:translateY(-8px) rotate(1deg)} }
        @keyframes ae-saved { 0%{transform:scale(0.8);opacity:0} 50%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
        @keyframes ae-tab-in { from{opacity:0;transform:translateY(10px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        .ae-s1{animation:ae-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.00s both}
        .ae-s2{animation:ae-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.08s both}
        .ae-s3{animation:ae-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.16s both}
        .ae-s4{animation:ae-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.24s both}
        .ae-s5{animation:ae-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.32s both}
        .ae-grid-in{animation:ae-tab-in 0.3s cubic-bezier(0.22,1,0.36,1) both}

        .ae-avatar-container {
          width:clamp(120px,38vw,190px);
          height:clamp(120px,38vw,190px);
          border-radius:50%;
          overflow:hidden;
          flex-shrink:0;
          animation:ae-idle 3.5s ease-in-out infinite;
          filter:drop-shadow(0 10px 18px rgba(0,0,0,0.13));
          margin-left:auto;
          margin-right:auto;
          display:block;
        }
        .ae-avatar-container svg { width:100%!important; height:100%!important; display:block; }

        .ae-body-container {
          width: clamp(90px, 24vw, 140px);
          height: clamp(180px, 48vw, 280px);
          border-radius: 16px;
          overflow: hidden;
          flex-shrink: 0;
          animation: ae-idle 3.5s ease-in-out infinite;
          filter: drop-shadow(0 10px 18px rgba(0,0,0,0.13));
          margin-left: auto;
          margin-right: auto;
          display: block;
        }
        .ae-body-container svg { width:100%!important; height:100%!important; display:block; }

        .ae-tabs::-webkit-scrollbar{height:5px}
        .ae-tabs::-webkit-scrollbar-track{background:transparent}
        .ae-tabs::-webkit-scrollbar-thumb{background:#c7d2fe;border-radius:999px}
        .ae-tabs::-webkit-scrollbar-thumb:hover{background:#818cf8}
        @media(hover:none){.ae-tabs::-webkit-scrollbar{display:none}.ae-tabs{scrollbar-width:none}}
      `}</style>

      {/* Blobs */}
      <div className="absolute pointer-events-none rounded-full" style={{top:"-8%",left:"-8%",width:"clamp(160px,30vw,300px)",height:"clamp(160px,30vw,300px)",background:"radial-gradient(circle,rgba(251,207,232,0.5) 0%,transparent 70%)"}} />
      <div className="absolute pointer-events-none rounded-full" style={{bottom:"-4%",right:"-6%",width:"clamp(180px,35vw,340px)",height:"clamp(180px,35vw,340px)",background:"radial-gradient(circle,rgba(254,240,138,0.4) 0%,transparent 70%)"}} />

      <div className="relative max-w-2xl mx-auto flex flex-col gap-5 z-10">

        {/* ── TOP BAR ── */}
        <div className="ae-s1 flex items-center justify-between gap-2">
    <AppButton
  type="button"
  variant="neutral"
  onClick={() => navigate("/menu")}
  className="shrink-0"
  style={{
    padding: "clamp(8px,2vw,12px) clamp(10px,2.5vw,18px)",
    fontSize: "clamp(12px,2.5vw,15px)",
  }}
>
  {t("avatar.back")}
</AppButton>

          <h1
            className="font-black text-indigo-700 text-center leading-tight"
            style={{ fontSize:"clamp(16px,4vw,26px)" }}
          >
            <span className="inline-flex items-center justify-center gap-2">
              {t("avatar.title")}
              <img
                src={paletteIcon}
                alt=""
                aria-hidden="true"
                draggable="false"
                className="h-5 w-5 object-contain sm:h-6 sm:w-6"
              />
            </span>
          </h1>

        <AppButton
  type="button"
  onClick={handleSave}
  disabled={saving}
  variant={saved ? "primary" : "indigo"}
  className="shrink-0"
  style={{
    padding: "clamp(8px,2vw,12px) clamp(10px,2.5vw,18px)",
    fontSize: "clamp(12px,2.5vw,15px)",
    animation: saved ? "ae-saved 0.4s ease both" : "none",
  }}
>
  {saving ? (
    <>
      <img
        src={saveIcon}
        alt=""
        aria-hidden="true"
        draggable="false"
        className="h-4 w-4 animate-pulse object-contain sm:h-5 sm:w-5"
      />
      <span>…</span>
    </>
  ) : saved ? (
    <>
      <img
        src={checkIcon}
        alt=""
        aria-hidden="true"
        draggable="false"
        className="h-4 w-4 object-contain sm:h-5 sm:w-5"
      />
      <span>{t("avatar.saved")}</span>
    </>
  ) : (
    <>
      <img
        src={saveIcon}
        alt=""
        aria-hidden="true"
        draggable="false"
        className="h-4 w-4 object-contain sm:h-5 sm:w-5"
      />
      <span>{t("avatar.save")}</span>
    </>
  )}
</AppButton>
        </div>

        {/* ── KEYS BAR ── */}
        <div className="ae-s2">
          <KeysBar keys={currentKeys} />
        </div>

        {/* ── GENDER SELECTOR ── */}
        <div className="ae-s2">
          <GenderSelector value={avatar.gender || "male"} onChange={handleGenderChange} />
        </div>

        {/* ── AVATAR PREVIEW ── */}
        <div className="ae-s2 flex flex-col items-center gap-3 w-full">
          {isOutfitTab ? (
            <div className="ae-body-container">
              <AvatarCanvas avatar={avatar} size={140} animated={false} fullBody={true} />
            </div>
          ) : (
            <div className="ae-avatar-container">
              <AvatarCanvas avatar={avatar} size={190} animated={false} fullBody={false} />
            </div>
          )}
          <p
            className="flex items-center justify-center gap-1.5 font-black text-indigo-600"
            style={{ fontSize: "clamp(14px, 3vw, 18px)" }}
          >
            <span>{user?.name}</span>
            <img
              src={wavingIcon}
              alt=""
              aria-hidden="true"
              draggable="false"
              className="h-5 w-5 shrink-0 object-contain sm:h-6 sm:w-6"
            />
          </p>
        </div>

        {/* ── TAB BAR ── */}
        <div className="ae-s3 ae-tabs flex gap-2 overflow-x-auto pb-2 w-full">
          {TABS.map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-shrink-0 font-bold rounded-full border transition-all duration-200
                ${activeTab === key
                  ? "bg-indigo-500 border-indigo-500 text-white shadow-[0_8px_20px_rgba(99,102,241,0.35)]"
                  : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50"
                }`}
              style={{ padding:"clamp(6px,1.5vw,10px) clamp(9px,2.2vw,15px)", fontSize:"clamp(11px,2vw,14px)" }}
            >
              {t(`avatar.tabs.${key}`)}
            </button>
          ))}
        </div>

        {/* ── OPTIONS GRID ── */}
        <div
          key={activeTab}
          className="ae-s4 ae-grid-in bg-white/95 backdrop-blur-sm border border-indigo-100 rounded-3xl shadow-[0_20px_45px_rgba(15,23,42,0.06)] w-full"
          style={{ padding:"clamp(12px,3vw,22px)" }}
        >
          {activeTab === "bg" ? (
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
              {currentOptions.map((opt) => {
                const isSel = avatar.bg === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => select("bg", opt.id)}
                    title={getLabel(opt, i18n.language)}
                    className={`relative rounded-2xl border-4 transition-all duration-200
                      ${isSel ? "border-indigo-500 shadow-lg" : "border-transparent hover:border-indigo-300"}`}
                    style={{ background: opt.color, aspectRatio:"1 / 1" }}
                  >
                    {isSel && (
                      <span
                        className="absolute inset-0 flex items-center justify-center text-white font-black drop-shadow"
                        style={{ fontSize:"clamp(14px,4vw,20px)" }}
                      >✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {currentOptions.map((opt) => (
                <AvatarOptionButton
                  key={opt.id}
                  opt={opt}
                  part={activeTab}
                  isSelected={avatar[activeTab] === opt.id}
                  isUnlocked={itemUnlocked(opt)}
                  canAfford={currentKeys >= (opt.keyCost || 0)}
                  onSelect={select}
                  onBuyClick={openBuyModal}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── RANDOMISE ── */}
        <div className="ae-s5 flex justify-center pb-4">
   <AppButton
  type="button"
  variant="secondary"
  onClick={() => {
    const rand = (part, arr) => {
      const pool = arr.filter(
        (o) =>
          !o.locked ||
          user?.progress?.avatar?.unlocked?.[part]?.[o.id]
      );

      const safe = pool.length ? pool : arr.filter((o) => !o.locked);

      return safe[Math.floor(Math.random() * safe.length)]?.id;
    };

    setAvatar((prev) => ({
      gender: prev.gender,
      skin: rand("skin", AVATAR_PARTS.skin),
      eyes: rand("eyes", AVATAR_PARTS.eyes),
      mouth: rand("mouth", AVATAR_PARTS.mouth),
      hair: rand("hair", AVATAR_PARTS.hair),
      outfit: rand("outfit", AVATAR_PARTS.outfit),
      accessory: rand("accessory", AVATAR_PARTS.accessory),
      bg: rand("bg", AVATAR_PARTS.bg),
    }));

    setSaved(false);
  }}
  className="font-black"
  style={{
    padding: "clamp(10px,2.5vw,14px) clamp(20px,5vw,32px)",
    fontSize: "clamp(13px,2.5vw,16px)",
  }}
>
  <img
    src={diceIcon}
    alt=""
    aria-hidden="true"
    draggable="false"
    className="h-5 w-5 shrink-0 object-contain sm:h-6 sm:w-6"
  />

  <span>{t("avatar.randomise")}</span>
</AppButton>
        </div>

      </div>

      {/* ── BUY MODAL ── */}
      {pendingItem && (
        <BuyConfirmModal
          item={pendingItem}
          currentKeys={currentKeys}
          onConfirm={() => confirmPurchase(activeTab)}
          onCancel={closeBuyModal}
        />
      )}

    </div>
  );
}