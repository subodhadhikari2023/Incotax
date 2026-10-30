import { ChevronRightIcon } from "@/components/icons";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { home } from "@/content/home";

// Numbered steps joined by dotted gold arrows: a row from tablet up, stacked with downward arrows
// on phones. Labelled directly because the heading text is still PENDING.
export function HowItWorks() {
  const { steps, howItWorks } = home;

  return (
    <section aria-label="How it works" className="bg-bg">
      <div className="page-container py-[53px] md:py-[77px] lg:py-24">
        <SectionHeader
          id="how-heading"
          eyebrow="How it works"
          title={howItWorks.heading}
          intro={howItWorks.intro}
        />
        <ol className="mt-12 grid gap-y-4 md:grid-cols-4 md:gap-x-6">
          {steps.map((step, i) => (
            <li key={i} className="relative flex flex-col items-center text-center">
              <span className="flex size-[72px] items-center justify-center rounded-full bg-navy font-heading text-[32px] font-bold text-gold">
                {i + 1}
              </span>
              <p className="mt-5 text-[17px] font-semibold text-navy">{step.title}</p>
              <p className="mt-2 text-[15px] text-text-muted">{step.text}</p>
              {i < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="mt-4 flex flex-col items-center text-gold-arrow md:absolute md:top-[30px] md:left-[calc(50%+48px)] md:mt-0 md:w-[calc(100%-96px+24px)] md:flex-row"
                >
                  <span className="h-8 border-l-2 border-dotted border-gold-arrow md:h-0 md:flex-1 md:border-t-2 md:border-l-0" />
                  <ChevronRightIcon className="rotate-90 text-xs md:rotate-0" />
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
