import { StarIcon } from "@/components/icons";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { home } from "@/content/home";
import type { HomeNodes } from "@/lib/home-content";

// "What Clients Say": review cards with stars, quote mark, text, name and city/service. Real reviews
// only; none hides the section. Centred, 3 across from tablet up, 1 per row on phones.
export function ReviewsSection({
  content = home,
  after,
}: {
  content?: HomeNodes;
  /** The panel's add control. With it, the section stays on screen while empty. */
  after?: React.ReactNode;
}) {
  if (content.reviews.length === 0 && !after) return null;

  return (
    <section aria-labelledby="reviews-heading" className="bg-tint">
      <div className="page-container py-[53px] md:py-[77px] lg:py-24">
        <SectionHeader
          id="reviews-heading"
          eyebrow="Reviews"
          title="What Clients Say"
          intro={content.reviewsIntro}
        />
        <div className="mt-10 flex flex-wrap justify-center gap-6">
          {content.reviews.map((review, i) => (
            <article
              key={i}
              className="relative flex w-full flex-col rounded-[20px] bg-white p-7 shadow-card md:w-[calc((100%-3rem)/3)]"
            >
              <div>
                <p role="img" className="flex gap-1 text-gold-deep" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }, (_, s) => (
                    <StarIcon key={s} className="text-sm" />
                  ))}
                </p>
                <span
                  aria-hidden="true"
                  className="absolute top-4 right-7 font-heading text-[72px] leading-none text-gold"
                >
                  ”
                </span>
              </div>
              <p className="mt-4 flex-1 text-base text-text-body">{review.text}</p>
              <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                <span aria-hidden="true" className="size-10 shrink-0 rounded-full bg-gold-tint" />
                <div>
                  <p className="text-[15px] font-semibold text-navy">{review.name}</p>
                  {review.detail && <p className="text-[13px] text-text-muted">{review.detail}</p>}
                </div>
              </div>
            </article>
          ))}
        </div>
        {after}
      </div>
    </section>
  );
}
