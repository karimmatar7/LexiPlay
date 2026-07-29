import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { sha256 } from "js-sha256";
import { supabase } from "../supaBaseClient.js";
import NotificationModal from "../components/NotificationModal";

export default function ResetParentalPinPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    message: "",
    type: "error",
  });

  const showMessage = (message, type = "error") => {
    setModalConfig({ message, type });
    setShowModal(true);
  };

  const handleReset = async (event) => {
    event.preventDefault();

    if (!token) {
      showMessage(t("resetParentalPin.errors.invalidLink"));
      return;
    }

    if (!/^\d{4,6}$/.test(newPin)) {
      showMessage(t("resetParentalPin.errors.pinLength"));
      return;
    }

    if (newPin !== confirmPin) {
      showMessage(t("resetParentalPin.errors.pinMismatch"));
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke(
        "complete-parental-pin-reset",
        {
          body: {
            token,
            parentalPinHash: sha256(newPin),
          },
        }
      );

      if (error) {
        throw new Error(error.message || t("resetParentalPin.errors.resetFailed"));
      }

      if (!data?.success) {
        throw new Error(
          data?.error || t("resetParentalPin.errors.resetFailed")
        );
      }

      showMessage(t("resetParentalPin.success"), "success");

      window.setTimeout(() => {
        navigate("/", { replace: true });
      }, 1600);
    } catch (error) {
      showMessage(
        error.message || t("resetParentalPin.errors.resetFailed")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 p-4">
        <section className="w-full max-w-md rounded-3xl border border-purple-100 bg-white/95 p-6 shadow-[0_25px_60px_rgba(147,51,234,0.2)] backdrop-blur-sm sm:p-8">
          <header className="mb-7 text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-2xl border border-purple-100 bg-purple-50 p-4">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-purple-600"
                aria-hidden="true"
              >
                <path d="M12 3a5 5 0 0 0-5 5v3" />
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M12 15v2" />
              </svg>
            </div>

            <h1 className="text-2xl font-black text-purple-800 sm:text-3xl">
              {t("resetParentalPin.title")}
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {t("resetParentalPin.subtitle")}
            </p>
          </header>

          {!token ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
              <p className="text-sm font-semibold text-red-700">
                {t("resetParentalPin.errors.invalidLink")}
              </p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <label
                  htmlFor="new-pin"
                  className="mb-1.5 block text-sm font-bold text-gray-700"
                >
                  {t("resetParentalPin.newPinLabel")}
                </label>

                <div className="relative">
                  <input
                    id="new-pin"
                    type={showPin ? "text" : "password"}
                    inputMode="numeric"
                    autoComplete="new-password"
                    placeholder={t("resetParentalPin.pinPlaceholder")}
                    value={newPin}
                    onChange={(event) =>
                      setNewPin(event.target.value.replace(/\D/g, ""))
                    }
                    maxLength={6}
                    disabled={loading}
                    className="w-full rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3.5 pr-12 text-lg tracking-[0.3em] transition-all focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 disabled:bg-gray-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPin((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-purple-600"
                    aria-label={
                      showPin
                        ? t("resetParentalPin.hidePin")
                        : t("resetParentalPin.showPin")
                    }
                  >
                    {showPin
                      ? t("resetParentalPin.hidePin")
                      : t("resetParentalPin.showPin")}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm-pin"
                  className="mb-1.5 block text-sm font-bold text-gray-700"
                >
                  {t("resetParentalPin.confirmPinLabel")}
                </label>

                <input
                  id="confirm-pin"
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  autoComplete="new-password"
                  placeholder={t("resetParentalPin.confirmPinPlaceholder")}
                  value={confirmPin}
                  onChange={(event) =>
                    setConfirmPin(event.target.value.replace(/\D/g, ""))
                  }
                  maxLength={6}
                  disabled={loading}
                  className="w-full rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3.5 text-lg tracking-[0.3em] transition-all focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 disabled:bg-gray-100"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-full bg-purple-600 py-3.5 font-bold text-white shadow-[0_8px_20px_rgba(147,51,234,0.35)] transition-all hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-purple-400"
              >
                {loading
                  ? t("resetParentalPin.resetting")
                  : t("resetParentalPin.resetButton")}
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={() => navigate("/", { replace: true })}
            className="mt-5 w-full text-sm font-semibold text-purple-600 transition-colors hover:text-purple-800"
          >
            {t("resetParentalPin.backToHome")}
          </button>
        </section>
      </main>

      <NotificationModal
        show={showModal}
        onClose={() => setShowModal(false)}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </>
  );
}