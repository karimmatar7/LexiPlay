export default function StatCards({ cards }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, i) => (
        <div key={i} className={`rounded-2xl border-2 ${card.color} p-3 sm:p-4 space-y-1`}>
          <p className="text-xs font-semibold text-gray-500 leading-tight">{card.label}</p>
          <p className="text-xl sm:text-2xl font-black text-[#7E22CE] leading-tight">{card.value}</p>
          {card.sub && <p className="text-xs text-gray-400 leading-tight">{card.sub}</p>}
        </div>
      ))}
    </div>
  );
}
