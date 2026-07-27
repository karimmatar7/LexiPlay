// src/components/LeaderboardOverlay.jsx
import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../supaBaseClient";
import { useTranslation } from "react-i18next";
import AvatarCanvas from "./AvatarCanvas";

const MEDALS     = ["🥇", "🥈", "🥉"];
const MEDAL_BG   = ["bg-yellow-50 border-yellow-200", "bg-slate-50 border-slate-200", "bg-orange-50 border-orange-200"];
const MEDAL_TEXT = ["text-yellow-600", "text-slate-500", "text-orange-500"];

// ── Avatar wrapper — same pattern as GameMenuHeader ──────────────────
function MiniAvatar({ avatar, size = 38 }) {
  if (!avatar) {
    return (
      <div
        className="rounded-full bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center shrink-0 text-base"
        style={{ width: size, height: size }}
      >
        👤
      </div>
    );
  }
  return (
    <div
      className="rounded-full overflow-hidden border-2 border-white shadow shrink-0"
      style={{ width: size, height: size }}
    >
      <AvatarCanvas avatar={avatar} size={size} animated={false} fullBody={false} />
    </div>
  );
}

// ── Rank change arrow ────────────────────────────────────────────────
function RankChange({ prev, curr }) {
  if (prev === null || prev === curr) return null;
  const up = curr < prev;
  return (
    <span className={`inline-flex items-center text-xs font-black ml-1 animate-fade-in
      ${up ? "text-emerald-500" : "text-red-400"}`}>
      {up ? "▲" : "▼"}
    </span>
  );
}

export default function LeaderboardOverlay({ currentUserId, onClose }) {
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const prevRanks = useRef({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("users").select("id, name, progress, avatar");
      if (error || !data) { setLoading(false); return; }

      const filtered = data
        .filter((u) => u.progress?.letterDraw?.highScore > 0 || u.progress?.letterDraw?.score > 0)
        .map((u) => ({
          id:        u.id,
          name:      u.name,
          avatar:    u.avatar || null,
          score:     u.progress?.letterDraw?.score     || 0,
          highScore: u.progress?.letterDraw?.highScore || 0,
        }));

      setEntries(filtered);
      setLoading(false);
    };
    load();
  }, []);

  const sorted = [...entries].sort((a, b) => b.highScore - a.highScore);

  const ranked = sorted.map((e, i) => {
    const rank    = i + 1;
    const prevRnk = prevRanks.current[e.id] ?? null;
    return { ...e, rank, prevRank: prevRnk };
  });

  useEffect(() => {
    const map = {};
    ranked.forEach((e) => { map[e.id] = e.rank; });
    prevRanks.current = map;
  });

  const myEntry = ranked.find((e) => e.id === currentUserId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl
          shadow-[0_25px_60px_rgba(15,23,42,0.25)] overflow-hidden animate-fade-in border border-indigo-100"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Header ── */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 bg-indigo-50 rounded-2xl p-2 border border-indigo-100">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-indigo-600"
                  aria-hidden="true"
                >
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-indigo-700 tracking-tight">
                  {t("leaderboard.title", "Leaderboard")}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  {t("leaderboard.subtitle", "Letter Draw — High Scores")}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center bg-slate-50 hover:bg-slate-100
                text-slate-500 rounded-full border border-slate-200 transition-all duration-200 flex-shrink-0"
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* My rank banner */}
          {myEntry && (
            <div className="mt-4 flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-2xl px-4 py-3">
              <MiniAvatar avatar={myEntry.avatar} size={44} />
              <div className="flex-1 min-w-0">
                <p className="text-indigo-700 font-black text-sm truncate">
                  {myEntry.name}
                  <span className="ml-1.5 text-xs font-semibold text-indigo-400">
                    ({t("leaderboard.you", "you")})
                  </span>
                </p>
                <p className="text-indigo-500 text-xs mt-0.5">
                  {t("leaderboard.yourHighScore", "Your best")}: <strong>{myEntry.highScore}</strong> ⚽
                  &nbsp;·&nbsp;
                  {t("leaderboard.current", "Now")}: {myEntry.score} ⚽
                </p>
              </div>
              <div className="flex flex-col items-center shrink-0">
                <span className="text-2xl font-black text-indigo-600">#{myEntry.rank}</span>
                <RankChange prev={myEntry.prevRank} curr={myEntry.rank} />
              </div>
            </div>
          )}
        </div>

        {/* ── List ── */}
        <div className="overflow-y-auto bg-slate-50" style={{ maxHeight: "52vh" }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-slate-400 text-sm font-medium">{t("leaderboard.loading", "Loading…")}</p>
            </div>
          ) : ranked.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <span className="text-5xl">🎯</span>
              <p className="text-slate-500 text-sm font-semibold text-center px-8">
                {t("leaderboard.empty", "No scores yet — be the first!")}
              </p>
            </div>
          ) : (
            <ul className="px-3 py-3 space-y-2">
              {ranked.map((entry) => {
                const isMe   = entry.id === currentUserId;
                const isTop3 = entry.rank <= 3;

                return (
                  <li
                    key={entry.id}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-2xl border transition-all duration-300
                      ${isMe
                        ? "bg-indigo-50 border-indigo-200 shadow-sm"
                        : isTop3
                          ? `${MEDAL_BG[entry.rank - 1]} shadow-sm`
                          : "bg-white border-slate-100 hover:border-indigo-100"
                      }
                    `}
                  >
                    {/* Rank */}
                    <div className="w-7 text-center shrink-0">
                      {isTop3
                        ? <span className="text-xl leading-none">{MEDALS[entry.rank - 1]}</span>
                        : <span className={`text-xs font-black ${isMe ? "text-indigo-600" : "text-slate-400"}`}>
                            #{entry.rank}
                          </span>
                      }
                    </div>

                    {/* Avatar */}
                    <MiniAvatar avatar={entry.avatar} size={38} />

                    {/* Name + current score */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm truncate leading-tight
                        ${isMe ? "text-indigo-700" : isTop3 ? MEDAL_TEXT[entry.rank - 1] : "text-slate-700"}`}>
                        {entry.name}
                        {isMe && (
                          <span className="ml-1 text-xs font-semibold text-indigo-400">
                            ({t("leaderboard.you", "you")})
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {t("leaderboard.current", "Now")}: {entry.score} ⚽
                      </p>
                    </div>

                    {/* High score */}
                    <div className="flex flex-col items-end shrink-0">
                      <div className="flex items-center gap-0.5">
                        <span className={`font-black text-lg leading-none
                          ${isMe ? "text-indigo-600" : isTop3 ? MEDAL_TEXT[entry.rank - 1] : "text-slate-700"}`}>
                          {entry.highScore}
                        </span>
                        <span className="text-base">⚽</span>
                        <RankChange prev={entry.prevRank} curr={entry.rank} />
                      </div>
                      <span className="text-xs text-slate-400">
                        {t("leaderboard.best", "best")}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-3 border-t border-slate-100 bg-white text-center">
          <p className="text-xs text-slate-400 font-medium">
            {t("leaderboard.ranked", "Ranked by best score (high score)")}
          </p>
        </div>
      </div>
    </div>
  );
}