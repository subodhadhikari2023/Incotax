import { planNames, type IncludedItem } from "@/content/service-details";

const PLAN_COUNT = Object.keys(planNames).length;

// Numbered "What this service covers" cards. On plan services, items that are not in every plan
// say which plans include them.
export function IncludedList({ items }: { items: IncludedItem[] }) {
  return (
    <ol className="space-y-4">
      {items.map((item, i) => (
        <li
          key={item.name}
          className="flex items-start gap-5 rounded-[14px] border border-border bg-bg p-5 md:p-6"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-navy font-heading text-xl font-bold text-gold">
            {i + 1}
          </span>
          <div>
            <p className="text-[17px] font-semibold text-navy">{item.name}</p>
            <p className="mt-1 text-[15px] text-text-muted">{item.description}</p>
            {item.plans && item.plans.length < PLAN_COUNT && (
              <p className="mt-2 inline-block rounded-md bg-gold-tint px-2 py-0.5 text-[13px] font-semibold text-navy">
                {`Included in: ${item.plans.map((p) => planNames[p]).join(", ")}`}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
