"use client";

import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { GoldHeadline } from "@/components/home/HeroHeadline";
import { PopupContent } from "@/components/home/EnquiryPopup";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { TopBar } from "@/components/layout/TopBar";
import { ContactView } from "@/components/pages/ContactView";
import { HomeView } from "@/components/pages/HomeView";
import { LegalView } from "@/components/pages/LegalView";
import { ServiceView } from "@/components/pages/ServiceView";
import { WhyIncotaxView } from "@/components/pages/WhyIncotaxView";
import { SiteCopyProvider } from "@/components/SiteCopy";
import { WhatsAppBand } from "@/components/ui/WhatsAppBand";
import { WhatsAppNumberProvider } from "@/components/WhatsAppNumber";
import { home } from "@/content/home";
import { contact, legal, whyIncotax } from "@/content/pages";
import { getServiceDetail } from "@/content/service-details";
import { getService, otherServices } from "@/content/services";
import { pageCopy, site } from "@/content/site";
import type { HomeNodes } from "@/lib/home-content";
import { serviceCopyKey, serviceCopyFor } from "@/lib/service-copy";
import { defaultSiteCopy, type SiteCopyNodes } from "@/lib/site-copy-schema";

import { useEditor } from "./EditorContext";
import { PhotoSlot } from "./PhotoSlot";
import { fieldsFor, useFields } from "./useFields";

// One canvas per public page: the page's own components, with each piece of text swapped for an
// editable element. Fixed content (prices, names, links) stays as plain text.

const NO_NOTE = "";

function useBusinessNodes() {
  const f = useFields("business");
  return {
    phone: f.text("phone", site.phone),
    email: f.text("email", site.email),
    address: f.text("address", site.address),
    hours: f.text("hours", site.hours),
  };
}

function useSiteCopyNodes(): SiteCopyNodes {
  const f = useFields("site");
  const d = defaultSiteCopy;
  return {
    whatsappMessage: f.value("whatsappMessage") || d.whatsappMessage,
    band: {
      heading: f.text("whatsappBandHeading", d.band.heading),
      line: f.text("whatsappBandLine", d.band.line),
    },
    serviceCoversIntro: f.text("serviceCoversIntro", d.serviceCoversIntro),
    otherServicesIntro: f.text("otherServicesIntro", d.otherServicesIntro),
    forms: {
      submitLabel: f.text("submitLabel", d.forms.submitLabel),
      afterSubmit: f.value("afterSubmit") || d.forms.afterSubmit,
      note: f.text("formNote", d.forms.note),
    },
    popup: {
      label: f.text("popupLabel", d.popup.label),
      heading: f.text("popupHeading", d.popup.heading),
      line: f.text("popupLine", d.popup.line),
      note: f.text("popupNote", d.popup.note),
    },
  };
}

/** The top bar, header and footer, as on every public page. */
function SiteFrame({ children }: { children: React.ReactNode }) {
  const business = useFields("business");
  const nodes = useBusinessNodes();
  return (
    <WhatsAppNumberProvider number={business.value("whatsappNumber") || site.whatsappNumber}>
      <SiteCopyProvider copy={useSiteCopyNodes()}>
        <TopBar business={nodes} />
        <Header />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer business={nodes} />
      </SiteCopyProvider>
    </WhatsAppNumberProvider>
  );
}

/** Service cards appear on other pages, so their text is edited wherever the card shows. */
function useCardDescriptions(slugs: string[]) {
  const editor = useEditor();
  return Object.fromEntries(
    slugs.map((slug) => [
      slug,
      fieldsFor(editor, serviceCopyKey(slug)).text(
        "cardDescription",
        pageCopy.serviceCardDescription,
        {
          label: `${getService(slug)?.name ?? slug} card description`,
        },
      ),
    ]),
  );
}

function useStats(): { stats: HomeNodes["stats"]; add: React.ReactNode } {
  const f = useFields("home");
  return {
    stats: f.rows("stats").map((_, i) => ({
      value: (
        <>
          {f.cell("stats", i, "value")}
          {f.remove("stats", i)}
        </>
      ),
      label: f.cell("stats", i, "label"),
    })),
    add: f.add("stats"),
  };
}

export function HomeCanvas() {
  const f = useFields("home");
  const { stats, add: addStat } = useStats();
  const descriptions = useCardDescriptions(home.serviceSlugs);
  const highlights = f.rows("highlights");

  const content: HomeNodes = {
    ...home,
    hero: {
      label: f.text("heroLabel", home.hero.label),
      headline: f.text("headline", home.hero.headline, {
        display: (value) => <GoldHeadline text={value} goldPhrase={f.value("goldPhrase")} />,
      }),
      goldPhrase: null,
      text: f.text("heroText", home.hero.text),
    },
    stats,
    clients: f.rows("clients").map((_, i) => (
      <>
        {f.cell("clients", i, "name")}
        {f.remove("clients", i)}
      </>
    )),
    servicesIntro: f.text("servicesIntro", home.servicesIntro),
    howItWorks: {
      heading: f.text("howHeading", home.howItWorks.heading),
      intro: f.text("howIntro", home.howItWorks.intro),
    },
    steps: f.rows("steps").map((_, i) => ({
      title: (
        <>
          {f.cell("steps", i, "title")}
          {f.remove("steps", i)}
        </>
      ),
      text: f.cell("steps", i, "text"),
    })),
    fees: {
      ...home.fees,
      intro: f.text("feesIntro", home.fees.intro),
      featuredTag: f.text("featuredTag", home.fees.featuredTag),
      highlights: highlights.map((_, i) => (
        <>
          {f.cell("highlights", i, "text")}
          {f.remove("highlights", i)}
        </>
      )),
    },
    reviewsIntro: f.text("reviewsIntro", home.reviewsIntro),
    reviews: f.rows("reviews").map((_, i) => ({
      text: (
        <>
          {f.cell("reviews", i, "text")}
          {f.remove("reviews", i)}
        </>
      ),
      name: f.cell("reviews", i, "name"),
      detail: f.cell("reviews", i, "detail"),
    })),
  };

  return (
    <SiteFrame>
      <HomeView
        content={content}
        descriptions={descriptions}
        plainHighlights={highlights.map((row) => row.text)}
        slots={{
          stats: addStat,
          clients: f.add("clients"),
          steps: f.add("steps"),
          highlights: f.add("highlights", NO_NOTE),
          reviews: f.add("reviews"),
        }}
      />
    </SiteFrame>
  );
}

export function WhyIncotaxCanvas() {
  const f = useFields("whyIncotax");
  const { stats, add: addStat } = useStats();
  const courtLine = f.value("courtLine") || whyIncotax.courtLine;
  const areaLine = f.value("areaLine") || whyIncotax.areaLine;

  return (
    <SiteFrame>
      <WhyIncotaxView
        stats={stats}
        echo={{ courtLine, areaLine }}
        content={{
          ...whyIncotax,
          title: f.text("title", whyIncotax.title),
          intro: f.text("intro", whyIncotax.intro),
          aboutParagraphs: f.rows("aboutParagraphs").map((_, i) => (
            <>
              {f.cell("aboutParagraphs", i, "text")}
              {f.remove("aboutParagraphs", i)}
            </>
          )),
          founders: whyIncotax.founders.map((founder, i) => ({
            ...founder,
            bio: f.text(`founderBio${i}`, founder.bio),
            points: f.rows(`founderPoints${i}`).map((_, j) => (
              <>
                {f.cell(`founderPoints${i}`, j, "text")}
                {f.remove(`founderPoints${i}`, j)}
              </>
            )),
          })),
          practiceIntro: f.text("practiceIntro", whyIncotax.practiceIntro),
          courts: f.rows("courts").map((_, i) => (
            <>
              {f.cell("courts", i, "name")}
              {f.remove("courts", i)}
            </>
          )),
          areas: f.rows("areas").map((_, i) => (
            <>
              {f.cell("areas", i, "name")}
              {f.remove("areas", i)}
            </>
          )),
          courtLine: f.text("courtLine", whyIncotax.courtLine),
          areaLine: f.text("areaLine", whyIncotax.areaLine),
        }}
        slots={{
          about: f.add("aboutParagraphs"),
          photo: (i) => (
            <PhotoSlot section={`founderPhoto/${i}`} index={i} name={whyIncotax.founders[i].name} />
          ),
          stats: addStat,
          founderPoints: (i) => f.add(`founderPoints${i}`, NO_NOTE),
          practice: (
            <>
              {f.add("courts", NO_NOTE)}
              {f.add("areas", NO_NOTE)}
            </>
          ),
        }}
      />
    </SiteFrame>
  );
}

export function ContactCanvas() {
  const f = useFields("contact");
  return (
    <SiteFrame>
      <ContactView
        preview
        business={useBusinessNodes()}
        contact={{
          ...contact,
          title: f.text("title", contact.title),
          intro: f.text("intro", contact.intro),
          formHeading: f.text("formHeading", contact.formHeading),
          formLine: f.text("formLine", contact.formLine),
          whatsappLabel: f.text("whatsappLabel", contact.whatsappLabel),
          whatsappHeading: f.text("whatsappHeading", contact.whatsappHeading),
          whatsappLine: f.text("whatsappLine", contact.whatsappLine),
        }}
      />
    </SiteFrame>
  );
}

export function ServiceCanvas({ slug }: { slug: string }) {
  const editor = useEditor();
  const f = fieldsFor(editor, serviceCopyKey(slug));
  const service = getService(slug);
  const detail = getServiceDetail(slug);
  const descriptions = useCardDescriptions(otherServices(slug).map((other) => other.slug));
  const siteFields = useFields("site");
  if (!service) return null;

  return (
    <SiteFrame>
      <ServiceView
        service={service}
        detail={detail}
        message={f.value("whatsappMessage") || serviceCopyFor({}, slug).whatsappMessage}
        copy={{
          shortDescription: f.text("shortDescription", pageCopy.serviceShortDescription),
          overviewOne: f.text("overviewOne", detail.overview ?? pageCopy.serviceOverviewOne),
          overviewTwo: f.text("overviewTwo", pageCopy.serviceOverviewTwo),
        }}
        coversIntro={siteFields.text("serviceCoversIntro", pageCopy.serviceCoversIntro)}
        otherServicesIntro={siteFields.text("otherServicesIntro", pageCopy.otherServicesIntro)}
        descriptions={descriptions}
      />
    </SiteFrame>
  );
}

export function LegalCanvas({ slug, label }: { slug: string; label: string }) {
  const editor = useEditor();
  const f = fieldsFor(editor, `legal/${slug}`);

  return (
    <SiteFrame>
      <LegalView
        label={label}
        legal={{
          lastUpdated: f.text("lastUpdated", legal.lastUpdated),
          questionsLine: f.text("questionsLine", legal.questionsLine),
          sections: f.rows("sections").map((row, i) => ({
            heading: (
              <>
                {f.cell("sections", i, "heading")}
                {f.remove("sections", i)}
              </>
            ),
            tocLabel: row.heading || `Section ${i + 1}`,
            paragraphs: [
              f.cell(
                "sections",
                i,
                "body",
                "Text of this section. Leave a blank line between paragraphs.",
              ),
            ],
            list: [f.cell("sections", i, "list", "Optional bullet points, one per line.")],
          })),
        }}
        sectionsAfter={f.add(
          "sections",
          "With no sections here, the live page keeps showing its marked placeholder text.",
        )}
      />
    </SiteFrame>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p className="bg-tint px-5 py-2 text-center text-sm font-semibold text-navy md:px-8">
      {children}
    </p>
  );
}

/** Text used on many pages, gathered as it looks where it is used. */
export function SiteCanvas() {
  const siteFields = useFields("site");
  return (
    <SiteFrame>
      <Caption>The pop-up that opens over the home page</Caption>
      <div className="flex justify-center bg-bg px-4 py-10">
        <div className="relative w-full max-w-[500px] rounded-[20px] border-t-[6px] border-gold bg-white p-7 shadow-popup md:p-10">
          <PopupContent preview />
        </div>
      </div>

      <Caption>The form on the Contact page</Caption>
      <div className="page-container py-10">
        <EnquiryForm idPrefix="site-form" label="Contact form" withMessage twoColumns preview />
      </div>

      <Caption>On every service page</Caption>
      <div className="page-container space-y-3 py-10 text-center text-lg text-text-muted">
        <p>{siteFields.text("serviceCoversIntro", pageCopy.serviceCoversIntro)}</p>
        <p>{siteFields.text("otherServicesIntro", pageCopy.otherServicesIntro)}</p>
      </div>

      <Caption>The gold band near the bottom of most pages</Caption>
      <WhatsAppBand />
    </SiteFrame>
  );
}
