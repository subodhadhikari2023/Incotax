import type { HomeNodes } from "@/lib/home-content";

// Written out so Tailwind can find the class names: the row divides evenly for 1 to 4 stats.
const columns = ["", "md:grid-cols-1", "md:grid-cols-2", "md:grid-cols-3", "md:grid-cols-4"];

// Gold figures on navy, used by the home hero and Why IncoTax. 2×2 on phones without dividers.
export function StatsList({
  stats,
  className = "",
}: {
  stats: HomeNodes["stats"];
  className?: string;
}) {
  return (
    <ul className={`grid grid-cols-2 gap-x-6 gap-y-8 ${columns[stats.length]} ${className}`}>
      {stats.map((stat, i) => (
        <li
          key={i}
          className={`relative ${i > 0 ? "md:border-l md:border-navy-line md:pl-6" : ""}`}
        >
          <p className="font-heading text-[34px] leading-tight font-bold text-gold lg:text-[48px]">
            {stat.value}
          </p>
          <p className="mt-1 text-[15px] text-on-navy">{stat.label}</p>
        </li>
      ))}
    </ul>
  );
}
