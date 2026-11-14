// Content for Why IncoTax, Contact, the pop-up, legal pages and the 404 page.
// Bracketed values are PENDING (checklist rows); replace them when Zeeshan sends them.

export const forms = {
  submitLabel: "Get My Quote",
  /** Second button: opens a WhatsApp chat without filling in the form. */
  whatsappLabel: "WhatsApp",
  /** Paragraphs separated by a blank line; the first and last are shown in bold. */
  afterSubmit:
    "Thank You for Your Enquiry!\n\nYour form has been submitted successfully. Our team at IncoTax has received your details and will get in touch with you shortly to discuss your requirements and provide a suitable quotation.\n\nYour Trust, Our Commitment.",
  note: "Reply within 30 minutes.",
};

export const popup = {
  label: "[Short label]",
  heading: "Your Requirement. Our Expertise.",
  line: "Tell us what you need and get a personalised quote from our team.",
  note: "Reply within 30 minutes.",
};

export const whyIncotax = {
  title: "The Right Partner for Business Growth.",
  intro:
    "At IncoTax, we simplify the complexities of business registrations, taxation, legal documentation and regulatory compliance. We combine professional expertise, personalised guidance and a transparent approach to help entrepreneurs and businesses meet their legal and compliance requirements with confidence. From starting a business to managing ongoing compliance, we stand by you at every step so you can focus on what matters most—growing your business.",
  aboutParagraphs: [
    "IncoTax is a professional business, legal and compliance service provider dedicated to supporting entrepreneurs, startups and established businesses. We offer comprehensive assistance in company incorporation, business registrations, taxation, ROC and MCA compliance, legal documentation, trademark registration and regulatory requirements. Our approach combines practical knowledge, professional guidance and a clear understanding of the legal and regulatory framework governing businesses.",
    "We believe that every business deserves reliable professional support at every stage of its journey. From helping entrepreneurs establish their businesses to assisting companies with ongoing statutory and regulatory compliances, we focus on delivering organised, transparent and client-oriented solutions. At IncoTax, we value accuracy, confidentiality and timely communication, building lasting professional relationships through our commitment to quality service.",
  ],
  founders: [
    {
      role: "Founder",
      name: "Zeeshan Khan",
      title: "Advocate",
      bio: "Zeeshan Khan is an Advocate and a graduate of a BCI-affiliated university, with 2+ years of professional experience in Company Law, SEBI Law, Income Tax, GST, Intellectual Property Law, Civil Law, and Contract Law. He is committed to delivering practical, reliable, and legally sound solutions to clients.",
      points: [
        "Graduate of a BCI-affiliated university",
        "2+ years of professional experience",
        "High Courts of Patna and Calcutta",
      ],
    },
    {
      role: "Co-founder",
      name: "Palak Khemka",
      title: "CS Finalist",
      bio: "Palak Khemka is a Law Graduate and Company Secretary Finalist with 2+ years of professional experience in corporate and compliance matters. She has successfully contributed to the incorporation of 50+ companies, with expertise in company incorporation, corporate compliance, and regulatory processes.",
      points: [
        "Law Graduate",
        "Company Secretary Finalist",
        "2+ years of professional experience",
        "50+ companies incorporated",
      ],
    },
  ],
  practiceIntro: "Expertise Across Legal Practice Areas",
  courts: ["High Court of Patna", "High Court of Calcutta"],
  areas: [
    "Company Law",
    "SEBI Law",
    "Income Tax",
    "GST",
    "Intellectual Property Law",
    "Civil Law",
    "Contract Law",
  ],
  /** One line under each court / area card; empty shows the name only. */
  courtLine: "",
  areaLine: "",
};

/** Why IncoTax settings that aren't page text. */
export const whyIncotaxOptions = {
  /** Words of the headline shown in gold italic. */
  goldPhrase: "Business Growth",
};

export const contact = {
  title: "Contact Us",
  intro: "We’re Just a Message Away.",
  formHeading: "Let’s Discuss Your Requirements",
  formLine:
    "Share your details, and our team will get in touch with the right guidance and support.",
  whatsappLabel: "Fastest Reply",
  whatsappHeading: "[Talk to us on WhatsApp]",
  whatsappLine: "[One line: tap the button and the chat opens with a ready message]",
  map: "[Map: office location]",
};

export const legal = {
  lastUpdated: "[date]",
  questionsLine: "[One line with the email address or WhatsApp link to contact]",
  /** Section layout from the design; the real text is PENDING (Zeeshan has it). */
  sections: [
    { paragraphs: ["[Paragraph text for this section.]"] },
    {
      paragraphs: ["[Paragraph text for this section.]"],
      list: ["[List item]", "[List item]", "[List item]"],
    },
    { paragraphs: ["[Paragraph text for this section.]"] },
    {
      paragraphs: [
        "[Paragraph text for this section.]",
        "[Second paragraph, if this section needs one.]",
      ],
    },
    { paragraphs: ["[Paragraph text for this section.]"] },
  ].map((section, i) => ({ ...section, heading: `[Section ${i + 1} heading]` })),
};
