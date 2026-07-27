import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, updateParentalControl } from "../utils/user.js";
import NotificationModal from "../components/NotificationModal";
import { useTranslation } from "react-i18next";
import { useSettings } from "../context/SettingsContext";
import parentsIcon from "../assets/icons/parents.png";
import lockIcon from "../assets/icons/lock.png";
import clockIcon from "../assets/icons/clock.png";
import saveIcon from "../assets/icons/save.png";
import dashboardIcon from "../assets/icons/dashboard.png";
import homeIcon from "../assets/icons/home.png";

export default function ParentalControlPage({ user, fetchUser }) {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(60);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { fontType, fontSize } = useSettings();
  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans";
  const sizeMap = { small: "text-base", medium: "text-lg", large: "text-xl" };
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchControl() {
      if (!user?.id) return;
      const latestUser = await getUser(user.id);
      const control = latestUser?.parental_control || {};
      setEnabled(control.enabled || false);
      setDailyLimit(control.dailyLimitMinutes || 60);
    }
    fetchControl();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    await updateParentalControl(user.id, {
      enabled,
      dailyLimitMinutes: dailyLimit,
    });
    if (fetchUser) await fetchUser(); // refresh user state
    setSaving(false);
    setShowModal(true);
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-purple-50 via-purple-50 to-indigo-50 p-4 pb-10 md:p-8 relative overflow-hidden ${fontClass} ${sizeMap[fontSize]}`}
    >
      {/* Decorative shapes */}
      <div className="absolute top-12 right-12 w-32 h-32 bg-pink-200 rounded-full opacity-30 pointer-events-none" />
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-indigo-200 rounded-full opacity-25 pointer-events-none" />

      <div className="relative max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 md:mb-12">
          <div className="inline-flex items-center justify-center mb-5 md:mb-6 bg-white rounded-3xl p-6 md:p-8 shadow-[0_14px_30px_rgba(147,51,234,0.15)] border-4 border-purple-200">
            <img
              src={parentsIcon}
              alt=""
              aria-hidden="true"
              draggable="false"
              className="h-12 w-12 sm:h-16 sm:w-16 object-contain"
            />
          </div>
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-black mb-3 md:mb-4 text-purple-700"
            style={{ letterSpacing: "-0.02em" }}
          >
            {t("parentalControl.title")}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 font-medium">
            {t("parentalControl.subtitle")}
          </p>
        </div>

        {/* Settings Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-[0_20px_45px_rgba(15,23,42,0.06)] border border-purple-100 p-5 sm:p-6 md:p-8 mb-8 md:mb-10 space-y-6 md:space-y-8">
          {/* Enable Toggle */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-purple-50 rounded-2xl p-2.5 border border-purple-100">
              <img
                src={lockIcon}
                alt=""
                aria-hidden="true"
                draggable="false"
                className="h-6 w-6 sm:h-7 sm:w-7 object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
                {t("parentalControl.enableTitle")}
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mb-4">
                {t("parentalControl.enableDesc")}
              </p>

              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={() => setEnabled(!enabled)}
                className="inline-flex items-center gap-3"
              >
                <span
                  className={`relative w-16 h-9 sm:w-20 sm:h-10 rounded-full transition-colors duration-300 border-2 flex-shrink-0 ${
                    enabled
                      ? "bg-emerald-400 border-emerald-600"
                      : "bg-gray-300 border-gray-400"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-full shadow-md transition-all duration-300 ${
                      enabled ? "right-1" : "left-1"
                    }`}
                  />
                </span>
                <span className="text-sm sm:text-base font-semibold text-gray-700">
                  {enabled ? t("parentalControl.enabled") : t("parentalControl.disabled")}
                </span>
              </button>
            </div>
          </div>

          {/* Daily Limit */}
          <div className="flex items-start gap-4 pt-2 border-t border-gray-100">
            <div className="flex-shrink-0 bg-purple-50 rounded-2xl p-2.5 border border-purple-100 mt-6">
              <img
                src={clockIcon}
                alt=""
                aria-hidden="true"
                draggable="false"
                className="h-6 w-6 sm:h-7 sm:w-7 object-contain"
              />
            </div>
            <div className="flex-1 min-w-0 pt-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
                {t("parentalControl.dailyLimitTitle")}
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mb-4">
                {t("parentalControl.dailyLimitDesc")}
              </p>

              <div className="flex items-center gap-3 sm:gap-4">
                <input
                  type="range"
                  min="0"
                  max="240"
                  step="5"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  className="flex-1 h-2.5 bg-purple-200 rounded-full appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex items-center gap-1.5 bg-purple-50 border-2 border-purple-200 rounded-2xl px-3 py-2 flex-shrink-0">
                  <input
                    type="number"
                    min="0"
                    max="240"
                    value={dailyLimit}
                    onChange={(e) => {
                      let val = Number(e.target.value);
                      if (val < 0) val = 0;
                      if (val > 240) val = 240;
                      setDailyLimit(val);
                    }}
                    className="bg-transparent w-14 sm:w-16 text-center text-lg sm:text-xl font-bold text-purple-700 focus:outline-none"
                  />
                  <span className="text-xs sm:text-sm font-semibold text-purple-400">
                    {t("parentalControl.minutesShort") || "min"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-stretch justify-center gap-3 sm:gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 min-w-0 inline-flex items-center justify-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3.5 rounded-full font-bold shadow-[0_8px_20px_rgba(16,185,129,0.35)] hover:shadow-[0_10px_24px_rgba(16,185,129,0.45)] disabled:shadow-none transition-all duration-200 text-sm sm:text-base"
          >
            <img
              src={saveIcon}
              alt=""
              aria-hidden="true"
              draggable="false"
              className="h-5 w-5 object-contain"
            />
            <span>{saving ? t("parentalControl.saving") : t("parentalControl.save")}</span>
          </button>

          <button
            onClick={() => navigate(`/parent-dashboard/${user.id}`)}
            className="flex-1 min-w-0 inline-flex items-center justify-center gap-2.5 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3.5 rounded-full font-bold shadow-[0_8px_20px_rgba(99,102,241,0.35)] hover:shadow-[0_10px_24px_rgba(99,102,241,0.45)] transition-all duration-200 text-sm sm:text-base"
          >
            <img
              src={dashboardIcon}
              alt=""
              aria-hidden="true"
              draggable="false"
              className="h-5 w-5 object-contain"
            />
            <span>{t("parentalControl.viewDashboard")}</span>
          </button>

          <button
            onClick={() => navigate("/menu")}
            className="flex-1 min-w-0 inline-flex items-center justify-center gap-2.5 bg-white hover:bg-gray-50 text-gray-600 px-6 py-3.5 rounded-full font-bold border border-gray-200 hover:border-gray-300 shadow-sm transition-all duration-200 text-sm sm:text-base"
          >
            <img
              src={homeIcon}
              alt=""
              aria-hidden="true"
              draggable="false"
              className="h-5 w-5 object-contain"
            />
            <span>{t("parentalControl.backToMenu")}</span>
          </button>
        </div>
      </div>

      {/* Notification Modal */}
      <NotificationModal
        show={showModal}
        onClose={() => setShowModal(false)}
        message={t("parentalControl.successSave")}
        type="success"
      />
    </div>
  );
}