import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getCurrentProfile } from "../utils/auth.js";

export default function AuthCallbackPage({ onLogin }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const finishAuthentication = async () => {
      try {
        const profile = await getCurrentProfile();

        if (!active) return;

        if (!profile) {
          navigate("/", { replace: true });
          return;
        }

        onLogin(profile);
        navigate("/menu", { replace: true });
      } catch (error) {
        console.error("Auth callback error:", error);

        if (active) {
          navigate("/", { replace: true });
        }
      }
    };

    finishAuthentication();

    return () => {
      active = false;
    };
  }, [navigate, onLogin]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 p-4">
      <div className="w-full max-w-sm rounded-3xl border border-purple-100 bg-white p-8 text-center shadow-[0_25px_60px_rgba(147,51,234,0.15)]">
        <img
          src="/fox.png"
          alt={t("auth.logoAlt")}
          className="mx-auto h-20 w-20"
        />

        <p className="mt-5 text-lg font-bold text-purple-700">
          {t("auth.messages.signingIn")}
        </p>
      </div>
    </div>
  );
}