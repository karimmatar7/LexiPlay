import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export default function StatCards({ cards = [] }) {
  const { t } = useTranslation();
  const [showMore, setShowMore] = useState(false);

  const primaryCards = cards.slice(0, 2);
  const secondaryCards = cards.slice(2);

  return (
    <section>
      {/* Mobile: first two stats */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        {primaryCards.map((card, index) => (
          <StatCard key={card.label || index} card={card} />
        ))}
      </div>

      {/* Mobile: hidden secondary stats */}
      {secondaryCards.length > 0 && (
        <div className="mt-3 sm:hidden">
          {showMore && (
            <div className="grid grid-cols-2 gap-3">
              {secondaryCards.map((card, index) => (
                <StatCard key={card.label || index} card={card} />
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowMore((value) => !value)}
            className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-violet-100 bg-white px-4 py-2 text-sm font-bold text-violet-700 shadow-sm transition hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2"
            aria-expanded={showMore}
          >
            <span aria-hidden="true">{showMore ? "−" : "+"}</span>

            <span>
              {showMore
                ? t("parentDashboard.showLessStats", {
                    defaultValue: "Show less",
                  })
                : t("parentDashboard.showMoreStats", {
                    defaultValue: "More statistics",
                  })}
            </span>
          </button>
        </div>
      )}

      {/* Tablet and desktop: all stats */}
      <div className="hidden grid-cols-2 gap-4 sm:grid lg:grid-cols-4">
        {cards.map((card, index) => (
          <StatCard key={card.label || index} card={card} />
        ))}
      </div>
    </section>
  );
}

function StatCard({ card }) {
  return (
    <article
      className={`min-w-0 rounded-2xl border p-4 shadow-[0_8px_22px_rgba(15,23,42,0.04)] sm:p-5 ${
        card.color || "border-slate-200 bg-white"
      }`}
    >
      <p className="truncate text-xs font-bold leading-tight text-slate-500 sm:text-sm">
        {card.label}
      </p>

      <div className="mt-1.5 min-h-7 text-xl font-black leading-tight tracking-tight text-violet-700 sm:mt-2 sm:min-h-8 sm:text-2xl">
        {card.value}
      </div>

      {card.sub && (
        <p className="mt-1 truncate text-xs leading-tight text-slate-400 sm:text-sm">
          {card.sub}
        </p>
      )}
    </article>
  );
}