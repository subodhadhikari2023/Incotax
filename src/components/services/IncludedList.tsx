import { planNames, type PlanId } from "@/content/service-details";

/** One included item: text on the public page, editable elements in the admin panel. */
export type IncludedItemNodes = {
  name: React.ReactNode;
  description: React.ReactNode;
  plans?: readonly PlanId[];
  /** The panel's tick boxes for the plans this item belongs to. */
  extra?: React.ReactNode;
};

const PLAN_COUNT = Object.keys(planNames).length;

// Numbered "What this service covers" cards. On plan services, items that are not in every plan
// say which plans include them.
export function IncludedList({ items }: { items: IncludedItemNodes[] }) {
  return (
    <ol className="space-y-4">
      {items.map((item, i) => (
        <li
          key={i}
          className="relative flex items-start gap-5 rounded-[14px] border border-border bg-bg p-5 md:p-6"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-navy font-heading text-xl font-bold text-gold">
            {i + 1}
          </span>
          <div>
            <p className="text-[17px] font-semibold text-navy">{item.name}</p>
            {item.description && (
              <p className="mt-1 text-[15px] text-text-muted">{item.description}</p>
            )}
            {item.plans && item.plans.length < PLAN_COUNT && (
              <p className="mt-2 inline-block rounded-md bg-gold-tint px-2 py-0.5 text-[13px] font-semibold text-navy">
                {`Included in: ${item.plans.map((p) => planNames[p]).join(", ")}`}
              </p>
            )}
            {item.extra}
          </div>
        </li>
      ))}
    </ol>
  );
}
