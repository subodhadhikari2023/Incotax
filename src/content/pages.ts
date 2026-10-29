// Content for Why IncoTax, Contact, the pop-up, legal pages and the 404 page (CLAUDE.md §6, §9).
// Bracketed values are PENDING (checklist rows); replace them when Zeeshan sends them.

export const forms = {
  submitLabel: "[Submit button]",
  afterSubmit: "[Message shown after a form is submitted]",
  note: "[Short note: privacy / reply time]",
};

export const popup = {
  label: "[Short label]",
  heading: "Your Requirement. Our Expertise.",
  line: "Tell us what you need and get a personalised quote from our team.",
  note: "[Short note: privacy / callback time]",
};

export const whyIncotax = {
  title: "[Why IncoTax headline]",
  intro: "[One or two lines introducing the practice.]",
  aboutParagraphs: ["[About IncoTax: paragraph one.]", "[About IncoTax: paragraph two.]"],
  founders: [
    {
      role: "Founder",
      name: "Zeeshan Khan",
      title: "Advocate",
      bio: "Zeeshan Khan is an Advocate and a graduate of a BCI-affiliated university, with 2+ years of professional experience in Company Law, SEBI Law, Income Tax, GST, Intellectual Property Law, Civil Law, and Contract Law. He is committed to delivering practical, reliable, and legally sound solutions to clients.",
      points: [
        "[Education]",
        "[Enrolment details]",
        "[Years of experience]",
        "[Courts practised in]",
      ],
    },
    {
      role: "Co-founder",
      name: "Palak Khemka",
      title: "CS Finalist",
      bio: "Palak Khemka is a Law Graduate and Company Secretary Finalist with 2+ years of professional experience in corporate and compliance matters. She has successfully contributed to the incorporation of 50+ companies, with expertise in company incorporation, corporate compliance, and regulatory processes.",
      points: ["[Education]", "[Qualification]", "[Years of experience]", "[Key expertise]"],
    },
  ],
  practiceIntro: "[One line]",
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
  courtLine: "[One line about this court]",
  areaLine: "[One line about this area]",
};

export const contact = {
  title: "[Contact page headline]",
  intro: "[One line: the quickest way to reach the practice.]",
  formHeading: "[Heading for the contact form]",
  formLine: "[One line: what happens after the form is sent]",
  whatsappLabel: "[Short label, e.g. fastest reply]",
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
