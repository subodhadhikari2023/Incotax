"use client";

import { useRef, useState } from "react";

import { CheckIcon } from "@/components/icons";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import type { Plan, PlanId } from "@/content/service-details";
import { enquiryAbout } from "@/content/site";
import { formatINR } from "@/lib/format";

/** Items shown before "Show all", so the three cards start at a similar height. */
const VISIBLE_ITEMS = 8;
const FEATURED: PlanId = "standard";
const FEATURED_TAG = "Most Popular";

export type PlanCardItem = { name: string; plans?: readonly PlanId[] };

// Basic / Standard / Premium side by side from tablet up, Standard raised. On phones a row of tabs
// shows one plan at a time (starting on Standard), as in the reference Zeeshan sent. Each card lists
// only the items its plan includes; an item with no plan tags is in every plan.
export function PlanCards({
  serviceName,
  plans,
  items,
}: {
  serviceName: string;
  plans: Plan[];
  items: PlanCardItem[];
}) {
  const [selected, setSelected] = useState<PlanId>(
    plans.some((plan) => plan.id === FEATURED) ? FEATURED : plans[0].id,
  );
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (index + step + plans.length) % plans.length;
    setSelected(plans[next].id);
    tabs.current[next]?.focus();
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Plans"
        className="mb-6 grid grid-cols-3 gap-1 rounded-xl border border-border bg-white p-1 md:hidden"
      >
        {plans.map((plan, i) => {
          const active = plan.id === selected;
          return (
            <button
              key={plan.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`plan-tab-${plan.id}`}
              aria-selected={active}
              aria-controls={`plan-${plan.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setSelected(plan.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`min-h-11 rounded-lg text-[15px] font-semibold transition-colors ${
                active ? "bg-navy text-white" : "text-navy hover:bg-bg"
              }`}
            >
              {plan.name}
            </button>
          );
        })}
      </div>

      <div className="grid items-start gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            serviceName={serviceName}
            items={items.filter((item) => !item.plans || item.plans.includes(plan.id))}
            hiddenOnPhone={plan.id !== selected}
          />
        ))}
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  serviceName,
  items,
  hiddenOnPhone,
}: {
  plan: Plan;
  serviceName: string;
  items: PlanCardItem[];
  hiddenOnPhone: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const featured = plan.id === FEATURED;
  const shown = expanded ? items : items.slice(0, VISIBLE_ITEMS);
  const muted = featured ? "text-on-navy" : "text-text-muted";

  return (
    <article
      role="tabpanel"
      id={`plan-${plan.id}`}
      aria-labelledby={`plan-tab-${plan.id}`}
      className={`${hiddenOnPhone ? "hidden" : "flex"} flex-col rounded-[20px] p-7 md:flex md:p-8 ${
        featured
          ? "bg-navy text-white shadow-raised md:-mt-4"
          : "border border-border bg-white shadow-card"
      }`}
    >
      {featured && (
        <p className="mb-4 self-start rounded-md bg-gold px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-navy uppercase">
          {FEATURED_TAG}
        </p>
      )}
      <h3 className={`font-sans text-xl font-semibold ${featured ? "text-white" : "text-navy"}`}>
        {plan.name}
      </h3>
      <p
        className={`mt-3 font-heading text-[48px] leading-none font-bold ${featured ? "text-gold" : "text-navy"}`}
      >
        {formatINR(plan.price)}
      </p>
      <p className={`mt-2 text-sm ${muted}`}>Professional fee · government fees extra</p>

      <p
        className={`mt-6 border-t pt-6 text-[13px] font-semibold tracking-[0.1em] uppercase ${
          featured ? "border-navy-line text-gold" : "border-border text-text-muted"
        }`}
      >
        What&apos;s included
      </p>
      <ul className="mt-4 space-y-3 text-[15px]">
        {shown.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <CheckIcon
              className={`mt-1 shrink-0 text-sm ${featured ? "text-gold" : "text-gold-deep"}`}
            />
            <span>{item.name}</span>
          </li>
        ))}
      </ul>
      {items.length > VISIBLE_ITEMS && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((open) => !open)}
          className={`mt-4 min-h-11 self-start text-[15px] font-semibold underline underline-offset-4 ${
            featured ? "text-gold" : "text-navy hover:text-gold-darkest"
          }`}
        >
          {expanded ? "Show fewer" : `Show all ${items.length} items`}
        </button>
      )}

      <WhatsAppButton
        label="Get Started"
        variant={featured ? "gold" : "outline"}
        message={enquiryAbout(`${serviceName} (${plan.name} plan)`)}
        className="mt-8 w-full"
      />
    </article>
  );
}
