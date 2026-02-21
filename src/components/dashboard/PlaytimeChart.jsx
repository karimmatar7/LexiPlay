import React from "react";
import { Bar } from "react-chartjs-2";
import { format, parseISO } from "date-fns";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function PlaytimeChart({ dates, minutes, avgPerDay, t }) {
  const engagementColor =
    Number(avgPerDay) >= 15 ? "bg-emerald-50 border-emerald-200 text-emerald-700"
    : Number(avgPerDay) >= 5 ? "bg-amber-50 border-amber-200 text-amber-700"
    : "bg-rose-50 border-rose-200 text-rose-700";

  const engagementLabel =
    Number(avgPerDay) >= 15 ? t("parentDashboard.engagementHigh")
    : Number(avgPerDay) >= 5 ? t("parentDashboard.engagementMedium")
    : t("parentDashboard.engagementLow");

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border-2 border-purple-200 p-4 sm:p-6">
      <div className="flex justify-between items-start mb-4 sm:mb-5 flex-wrap gap-2 sm:gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-800">
            📊 {t("parentDashboard.dailyPlaytime")}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">{t("parentDashboard.dailyPlaytimeDesc")}</p>
        </div>
        <div className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold ${engagementColor}`}>
          {engagementLabel}
        </div>
      </div>

      {dates.length > 0 ? (
        <div className="relative h-52 sm:h-64">
          <Bar
            key={dates.join(",")}
            data={{
              labels: dates.map((d) => format(parseISO(d), "dd/MM")),
              datasets: [{
                label: t("parentDashboard.minutes"),
                data: minutes,
                backgroundColor: "rgba(126,34,206,0.75)",
                borderColor:     "rgba(109,40,217,1)",
                borderWidth: 2,
                borderRadius: 8,
              }],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { color: "rgba(0,0,0,0.05)" },
                  ticks: { callback: (v) => `${v}m`, font: { size: 11 } },
                },
                x: {
                  grid: { display: false },
                  ticks: { font: { size: 11 } },
                },
              },
            }}
          />
        </div>
      ) : (
        <div className="text-center py-10">
          <span className="text-4xl block mb-2">📭</span>
          <p className="text-gray-500 text-sm font-semibold">{t("parentDashboard.noPlaytime")}</p>
        </div>
      )}
    </div>
  );
}
