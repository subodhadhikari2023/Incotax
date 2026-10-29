import { Eyebrow } from "@/components/ui/Eyebrow";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { home } from "@/content/home";

import { HeroHeadline } from "./HeroHeadline";

// Navy home hero: label, headline, supporting text, WhatsApp button and 4 stats (4 across from
// tablet up with dividers, 2×2 on phones without).
export function HeroSection() {
  return (
    <section aria-label="Introduction" className="relative overflow-hidden bg-navy text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-1/2">
        <span className="absolute top-0 -right-48 size-[760px] rounded-full border border-navy-line" />
        <span className="absolute top-0 -right-16 size-[400px] rounded-full border border-navy-line" />
      </div>
      <div className="relative page-container pt-[62px] pb-12 md:pt-[90px] md:pb-14 lg:pt-28 lg:pb-16">
        <Eyebrow onNavy>{home.hero.label}</Eyebrow>
        <HeroHeadline text={home.hero.headline} goldPhrase={home.hero.goldPhrase} />
        <p className="mt-6 max-w-3xl text-[17px]/[27px] text-on-navy md:text-[19px]/[30px]">
          {home.hero.text}
        </p>
        <WhatsAppButton className="mt-9" />

        <ul className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-navy-line pt-10 md:grid-cols-4 lg:mt-20">
          {home.stats.map((stat, i) => (
            <li key={stat.label} className={i > 0 ? "md:border-l md:border-navy-line md:pl-6" : ""}>
              <p className="font-heading text-[34px] leading-tight font-bold text-gold lg:text-[48px]">
                {stat.value}
              </p>
              <p className="mt-1 text-[15px] text-on-navy">{stat.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
