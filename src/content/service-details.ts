// Service page content, entered from "SERVICES REVISED & FINAL.pdf" (00-Requirements). Wording is
// Zeeshan's; do not rewrite it. Short descriptions and overview paragraph two are still PENDING
// (see pageCopy in site.ts). Plan services list each item once, tagged with the plans that include it.
import { formatINR } from "@/lib/format";

export type PlanId = "basic" | "standard" | "premium";
export type Plan = { id: PlanId; name: string; price: number };

export type IncludedItem = { name: string; description: string; plans?: readonly PlanId[] };

export type PriceRow = { label: string; value: string };
export type Pricing =
  | { kind: "from" | "fixed"; amount: number; suffix?: string; rows: PriceRow[] }
  | { kind: "quote"; text: string };

export type ServiceDetail = {
  /** Overview paragraph from the PDF (Zeeshan's own wording), when the PDF has one. */
  overview?: string;
  included: IncludedItem[];
  plans?: Plan[];
  pricing: Pricing;
  notIncluded?: string;
  timeline?: string;
  /** Conditions and disclaimers from the PDF's pricing notes. */
  note?: string;
};

const PLANS: Plan[] = [
  { id: "basic", name: "Basic", price: 1499 },
  { id: "standard", name: "Standard", price: 3499 },
  { id: "premium", name: "Premium", price: 7499 },
];

const ALL: readonly PlanId[] = ["basic", "standard", "premium"];
const STD_UP: readonly PlanId[] = ["standard", "premium"];
const PREMIUM: readonly PlanId[] = ["premium"];

const planPricing: Pricing = {
  kind: "from",
  amount: Math.min(...PLANS.map((p) => p.price)),
  rows: PLANS.map((p) => ({ label: p.name, value: formatINR(p.price) })),
};

const PLAN_NOT_INCLUDED =
  "Government fees, applicable stamp duty, Digital Signature Certificate charges, third-party expenses and applicable GST.";

// Items shared by the incorporation services (same wording in the PDF).
const item = {
  nameSearch: {
    name: "Company Name Search",
    description: "Assistance with identifying a suitable company name.",
  },
  spice: {
    name: "SPICe+ Incorporation Filing",
    description: "Assistance with preparation and filing of the required incorporation forms.",
  },
  panTan: {
    name: "Company PAN & TAN",
    description: "Assistance with obtaining PAN and TAN through the incorporation process.",
  },
  moa: {
    name: "eMoA & eAoA Drafting",
    description: "Preparation of the Memorandum of Association and Articles of Association.",
  },
  coi: {
    name: "Certificate of Incorporation",
    description: "Assistance with obtaining the incorporation certificate.",
  },
  din: {
    name: "DIN for Directors",
    description:
      "Assistance with obtaining Director Identification Numbers for eligible directors through the applicable process.",
  },
  noc: {
    name: "NOC / Consent Letter Preparation",
    description:
      "Assistance with drafting the required No Objection Certificate (NOC) or consent letter for registration and compliance purposes, based on the applicable requirements.",
  },
  visibility: {
    name: "Company Visibility on Google & Government Portals",
    description:
      "Assistance with improving your company’s online visibility through relevant Google listings and guidance on accessing or updating applicable government portals, subject to eligibility and portal requirements.",
  },
  esic: {
    name: "ESIC Declaration",
    description:
      "Assistance with preparing and filing the applicable ESIC declaration, including employee details and required documentation, in accordance with ESIC requirements.",
  },
  epfo: {
    name: "EPFO Declaration",
    description:
      "Assistance with preparing and filing the applicable EPFO declaration, including employer and employee details and required documentation, in accordance with EPFO requirements.",
  },
  bankKit: {
    name: "Bank-Account-Ready Document Kit",
    description: "Essential incorporation documents organised for submission to the bank.",
  },
  postInc: {
    name: "Post-Incorporation Compliance Guidance",
    description:
      "Guidance on initial compliance requirements and the next steps after incorporation.",
  },
  msme: { name: "MSME Registration", description: "Assistance with Udyam registration." },
  gst: {
    name: "GST Registration",
    description:
      "Assistance with GST registration application, documentation and filing formalities, subject to applicable eligibility requirements.",
  },
  commencement: {
    name: "Business Commencement Compliance",
    description: "Assistance with the applicable commencement declaration and related formalities.",
  },
  startupIndia: {
    name: "Startup India Registration",
    description:
      "Assistance with the Startup India recognition application, subject to eligibility.",
  },
  dir3: {
    name: "DIR-3 KYC Filing",
    description:
      "Assistance with completing and filing DIR-3 KYC for directors to maintain compliance with applicable MCA requirements.",
  },
  adt1: {
    name: "ADT-1 Filing",
    description:
      "Assistance with preparing and filing Form ADT-1 to intimate the appointment of the statutory auditor with the MCA.",
  },
  agm: {
    name: "AGM Resolution Preparation",
    description:
      "Drafting of resolutions and related documentation for the Annual General Meeting (AGM), as applicable.",
  },
  intimation: {
    name: "Intimation Letter Preparation",
    description:
      "Assistance with drafting the required intimation letters for statutory and corporate compliance purposes.",
  },
  caConsent: {
    name: "Consent Letter from a Qualified Chartered Accountant",
    description:
      "Assistance with obtaining and preparing consent documentation from a practising Chartered Accountant accepting appointment as statutory auditor, subject to the professional’s consent.",
  },
  boardResolution: {
    name: "Board Resolution Preparation",
    description:
      "Drafting of board resolutions for corporate decisions and statutory compliance, based on the company’s requirements.",
  },
};

const premiumCompliance = (plans: readonly PlanId[]) =>
  [
    item.commencement,
    item.startupIndia,
    item.dir3,
    item.adt1,
    item.agm,
    item.intimation,
    item.caConsent,
    item.boardResolution,
  ].map((i) => ({ ...i, plans }));

export const serviceDetails: Record<string, ServiceDetail> = {
  "private-limited-company-incorporation": {
    plans: PLANS,
    pricing: planPricing,
    notIncluded: PLAN_NOT_INCLUDED,
    timeline:
      "7–15 working days, subject to document readiness, name availability and government processing timelines.",
    included: [
      {
        name: "Expert Assistance",
        description: "Guidance throughout the company incorporation process.",
        plans: ALL,
      },
      { ...item.nameSearch, plans: ALL },
      { ...item.spice, plans: ALL },
      { ...item.panTan, plans: ALL },
      { ...item.moa, plans: ALL },
      { ...item.coi, plans: STD_UP },
      { ...item.din, plans: ALL },
      { ...item.noc, plans: ALL },
      { ...item.visibility, plans: ALL },
      { ...item.esic, plans: ALL },
      { ...item.epfo, plans: ALL },
      { ...item.bankKit, plans: ALL },
      { ...item.postInc, plans: ALL },
      {
        name: "Digital Signature Certificates (DSCs)",
        description: "Assistance with DSC application and preparation.",
        plans: STD_UP,
      },
      { ...item.msme, plans: STD_UP },
      { ...item.gst, plans: STD_UP },
      ...premiumCompliance(PREMIUM),
    ],
    note: "Name approval, incorporation and statutory registrations are subject to the applicable laws and approval of the relevant authorities. Bank account opening is subject to the bank's requirements and approval.",
  },

  "llp-registration": {
    plans: PLANS,
    pricing: planPricing,
    notIncluded: PLAN_NOT_INCLUDED,
    timeline:
      "7–15 working days for LLP incorporation, subject to document readiness, name availability and government processing timelines.",
    included: [
      {
        name: "Expert Assistance",
        description: "Guidance throughout the LLP registration process.",
        plans: ALL,
      },
      {
        name: "Name Search",
        description: "Assistance with identifying a suitable company name.",
        plans: ALL,
      },
      {
        name: "Digital Signature Certificate (DSC) Assistance",
        description: "Support with the DSC application process for designated partners.",
        plans: STD_UP,
      },
      {
        name: "FiLLiP Form Filing",
        description: "Assistance with preparation and filing of the FiLLiP incorporation form.",
        plans: ALL,
      },
      {
        name: "Certificate of Incorporation",
        description: "Assistance with obtaining the LLP incorporation certificate.",
        plans: ALL,
      },
      {
        name: "LLP PAN & TAN",
        description: "Assistance with obtaining PAN and TAN through the applicable process.",
        plans: ALL,
      },
      {
        name: "DPIN for Designated Partners",
        description:
          "Assistance with obtaining Designated Partner Identification Numbers through the applicable process.",
        plans: ALL,
      },
      { ...item.noc, plans: ALL },
      {
        name: "Visibility on Google & Government Portals",
        description:
          "Assistance with improving your LLP’s online visibility through relevant Google listings and guidance on accessing or updating applicable government portals, subject to eligibility and portal requirements.",
        plans: ALL,
      },
      { ...item.postInc, plans: ALL },
      {
        name: "DSC Support",
        description: "Guidance on DSC requirements and setup for designated partners.",
        plans: STD_UP,
      },
      {
        name: "MSME Registration",
        description: "Assistance with Udyam registration for eligible businesses.",
        plans: STD_UP,
      },
      {
        name: "LLP Agreement Drafting & Filing",
        description:
          "Assistance with drafting the LLP Agreement based on the partners’ mutual understanding, preparing the required documentation, and filing Form 3 with the Ministry of Corporate Affairs (MCA), in accordance with applicable legal requirements.",
        plans: STD_UP,
      },
      { ...item.gst, plans: PREMIUM },
      {
        name: "Startup India Registration",
        description:
          "Assistance with the Startup India recognition application, subject to eligibility requirements.",
        plans: PREMIUM,
      },
    ],
    note: "Name approval, incorporation and statutory registrations are subject to applicable laws and approval by the relevant authorities.",
  },

  "opc-registration": {
    plans: PLANS,
    pricing: planPricing,
    notIncluded: PLAN_NOT_INCLUDED,
    included: [
      {
        name: "Expert Assistance",
        description: "Guidance throughout the OPC registration process.",
        plans: ALL,
      },
      { ...item.nameSearch, plans: ALL },
      {
        ...item.spice,
        description: "Assistance with preparing and filing the required incorporation forms.",
        plans: ALL,
      },
      {
        ...item.coi,
        description: "Assistance with obtaining the OPC incorporation certificate.",
        plans: ALL,
      },
      { ...item.panTan, plans: ALL },
      {
        ...item.din,
        description:
          "Assistance with obtaining Director Identification Numbers through the applicable process.",
        plans: ALL,
      },
      { ...item.moa, plans: ALL },
      { ...item.noc, plans: ALL },
      { ...item.visibility, plans: ALL },
      { ...item.esic, plans: ALL },
      { ...item.epfo, plans: ALL },
      { ...item.bankKit, plans: ALL },
      { ...item.postInc, plans: ALL },
      {
        name: "DSC Support",
        description: "Guidance on DSC requirements and setup.",
        plans: STD_UP,
      },
      {
        name: "MSME Registration",
        description: "Assistance with Udyam registration for eligible businesses.",
        plans: STD_UP,
      },
      { ...item.gst, plans: STD_UP },
      { ...item.commencement, plans: PREMIUM },
      {
        ...item.startupIndia,
        description:
          "Assistance with the Startup India recognition application, subject to eligibility requirements.",
        plans: PREMIUM,
      },
      ...[
        item.dir3,
        item.adt1,
        item.agm,
        item.intimation,
        item.caConsent,
        item.boardResolution,
      ].map((i) => ({ ...i, plans: PREMIUM })),
    ],
    note: "All registrations and approvals are subject to applicable eligibility requirements and the decisions of the relevant authorities.",
  },

  "section-8-company-registration": {
    pricing: {
      kind: "from",
      amount: 6499,
      rows: [{ label: "Professional fee", value: "from ₹6,499" }],
    },
    notIncluded:
      "Government fees, stamp duty, DSC charges, professional certification fees, third-party expenses and applicable GST.",
    included: [
      {
        name: "Expert Assistance",
        description: "Guidance throughout the Section 8 company incorporation process.",
      },
      item.nameSearch,
      {
        name: "DSC Assistance",
        description: "Support with Digital Signature Certificate requirements.",
      },
      {
        name: "Section 8 Licence Application",
        description:
          "Preparation and filing assistance for the licence application, subject to applicable requirements and approval.",
      },
      {
        name: "SPICe+ Incorporation Filing",
        description: "Preparation and filing of the incorporation application.",
      },
      {
        name: "MoA & AoA Drafting",
        description:
          "Drafting of the Memorandum and Articles of Association, including the applicable Section 8 format.",
      },
      {
        name: "DIN for Directors",
        description:
          "Assistance with Director Identification Number applications, where applicable.",
      },
      {
        name: "Certificate of Incorporation",
        description: "Incorporation documentation, subject to approval by the competent authority.",
      },
      {
        name: "Company PAN & TAN",
        description:
          "Assistance with PAN and TAN allotment through the applicable incorporation process.",
      },
      {
        name: "NGO DARPAN Registration",
        description:
          "Assistance with registration on the NGO DARPAN portal, subject to eligibility and applicable requirements.",
      },
      {
        name: "Bank-Account-Ready Document Kit",
        description:
          "Essential incorporation documents to support the organisation’s bank account application.",
      },
      {
        name: "Post-Incorporation Compliance Guidance",
        description: "Basic guidance on applicable initial compliance requirements.",
      },
    ],
    note: "Registration under 12AB and 80G, FCRA registration, and other specialised registrations or approvals are not included unless separately agreed in writing. NGO DARPAN registration and all statutory approvals are subject to applicable eligibility requirements and the relevant authority’s decision.",
  },

  "sole-proprietorship-registration": {
    pricing: {
      kind: "from",
      amount: 3499,
      rows: [{ label: "Professional fee", value: "from ₹3,499" }],
    },
    notIncluded:
      "Government fees, applicable GST, third-party expenses and charges for additional registrations or services.",
    included: [
      {
        name: "Expert Assistance",
        description:
          "Guidance on setting up your sole proprietorship based on your business activities.",
      },
      {
        name: "Business Name Guidance",
        description:
          "Assistance with selecting a suitable business name, subject to applicable naming and trademark requirements.",
      },
      {
        name: "MSME/Udyam Registration",
        description: "Assistance with Udyam registration, subject to eligibility.",
      },
      {
        name: "GST Registration Assistance",
        description:
          "Preparation and filing support for GST registration, where applicable or required.",
      },
      {
        name: "Shop & Establishment Registration",
        description: "Guidance and application assistance where applicable under state law.",
      },
      {
        name: "Business Tax Guidance",
        description:
          "Guidance on the proprietor’s PAN requirements and basic income-tax compliance.",
      },
      {
        name: "Current Account Documentation",
        description:
          "Assistance with preparing documents commonly requested by banks for a business current account.",
      },
      {
        name: "Post-Registration Guidance",
        description:
          "Basic guidance on applicable tax registrations and ongoing compliance requirements.",
      },
    ],
    note: "A sole proprietorship is not incorporated as a separate legal entity. Registrations such as GST, Udyam and Shop & Establishment are subject to eligibility and applicable legal requirements. Bank account opening is subject to the bank’s documentation requirements and approval.",
  },

  "private-limited-annual-compliance": {
    pricing: {
      kind: "from",
      amount: 25000,
      suffix: "per year (estimated)",
      rows: [
        { label: "ROC Annual Filing (AOC-4 & MGT-7/MGT-7A)", value: "₹1,500–₹5,000" },
        { label: "Statutory Audit Fees", value: "₹10,000–₹30,000+" },
        { label: "Income Tax Return Filing (ITR-6)", value: "₹2,000–₹10,000" },
        { label: "TDS Return Filing (if applicable)", value: "₹1,000–₹5,000 per quarter" },
        { label: "Statutory Registers & Compliance Documentation", value: "₹2,000–₹10,000" },
      ],
    },
    notIncluded: "Government filing fees, additional certifications and applicable GST.",
    included: [
      {
        name: "ROC Annual Filing (AOC-4 & MGT-7/MGT-7A)",
        description:
          "Preparation and filing of annual financial statements and annual returns with the ROC.",
      },
      {
        name: "Statutory Audit",
        description: "Annual audit of financial statements by a practising Chartered Accountant.",
      },
      {
        name: "Income Tax Return Filing (ITR-6)",
        description: "Preparation and filing of the company’s annual income tax return.",
      },
      {
        name: "TDS Return Filing (if applicable)",
        description: "Preparation and filing of quarterly TDS returns.",
      },
      {
        name: "Statutory Registers & Compliance Documentation",
        description:
          "Maintenance and updating of statutory registers and essential corporate records.",
      },
    ],
    note: "The above figures are indicative professional service fees and may vary depending on the company’s turnover, transaction volume, number of directors, compliance requirements and complexity. Statutory audit fees depend on the company’s size and audit requirements.",
  },

  "llp-annual-compliance": {
    pricing: {
      kind: "from",
      amount: 2000,
      rows: [
        { label: "Statutory Audit (if applicable)", value: "₹5,000–₹30,000+" },
        { label: "MCA Annual Filings", value: "₹2,000–₹8,000+" },
        { label: "Class 3 DSC", value: "₹1,500 per DSC" },
        { label: "PAN/TAN Correction or Update (if required)", value: "₹110–₹500+" },
      ],
    },
    notIncluded: "Government fees, professional certification charges and applicable taxes.",
    included: [
      {
        name: "Statutory Audit (if applicable)",
        description:
          "Audit of financial statements by a Chartered Accountant, where legally required.",
      },
      {
        name: "MCA Annual Filings",
        description:
          "Preparation and filing of Form 8 (Statement of Account & Solvency) and Form 11 (Annual Return).",
      },
      {
        name: "Class 3 DSC",
        description:
          "New issuance or renewal of a Digital Signature Certificate, generally valid for 2 years depending on the certificate.",
      },
      {
        name: "PAN/TAN Correction or Update (if required)",
        description: "Applicable government fees and service charges for corrections or updates.",
      },
    ],
    note: "Small LLPs with a capital contribution of up to ₹25 lakh and turnover of up to ₹40 lakh may qualify for reduced additional fees on certain delayed MCA filings, subject to applicable rules. Statutory audit requirements depend on the LLP’s contribution and turnover.",
  },

  "change-of-company-name": {
    overview:
      "Changing a company’s name involves name availability checks, corporate approvals, and statutory filings with the Ministry of Corporate Affairs (MCA). Businesses may engage a professional to assist with the process.",
    pricing: {
      kind: "from",
      amount: 5000,
      rows: [{ label: "Professional fees (indicative)", value: "₹5,000–₹15,000+" }],
    },
    notIncluded:
      "MCA filing fees, name reservation charges, stamp duty, professional certification charges and applicable GST.",
    included: [
      {
        name: "Name Search & Reservation",
        description:
          "Assistance with checking name availability and filing the RUN application, where applicable.",
      },
      {
        name: "Board Resolution",
        description: "Drafting the resolution approving the proposed name change.",
      },
      {
        name: "Shareholder Approval",
        description:
          "Preparation of the notice, explanatory statement, and special resolution for the general meeting.",
      },
      {
        name: "MGT-14 Filing",
        description: "Assistance with filing the special resolution with the MCA.",
      },
      {
        name: "INC-24 Filing",
        description:
          "Preparation and filing of the application for approval of the company name change.",
      },
      {
        name: "MOA & AOA Updates",
        description:
          "Assistance with updating the Memorandum and Articles of Association, as applicable.",
      },
      {
        name: "Post-Approval Guidance",
        description:
          "Guidance on updating company records and relevant registrations after approval.",
      },
    ],
    note: "The name change is subject to applicable legal requirements and approval by the competent authority. Additional fees may apply if further documentation or corrective filings are required.",
  },

  "gst-registration": {
    overview:
      "GST registration fees may vary depending on the type of business, documentation requirements, and professional service provider.",
    pricing: {
      kind: "from",
      amount: 1000,
      rows: [
        { label: "Professional fee (indicative)", value: "₹1,000–₹5,000" },
        { label: "Government application fee", value: "Generally none" },
      ],
    },
    notIncluded: "Any applicable tax deposit and applicable GST.",
    included: [
      {
        name: "Regular Businesses",
        description:
          "GST registration is generally free on the government portal. Professional assistance may involve additional fees.",
      },
      {
        name: "Casual Taxable Persons",
        description:
          "GST registration may require an advance deposit of estimated tax liability, as applicable under GST law.",
      },
      {
        name: "Non-Resident Taxable Persons",
        description:
          "Registration may require an advance deposit of estimated tax liability, as applicable under GST law.",
      },
    ],
    note: "The professional fee may vary depending on the nature of the business, document verification, application complexity, and additional assistance required. Registration is subject to eligibility and approval by the GST authorities.",
  },

  "gst-return-filing": {
    overview:
      "GST return filing frequency and due dates depend on the taxpayer’s registration type and applicable filing scheme.",
    pricing: {
      kind: "quote",
      text: "For GST return filing charges and customised compliance packages, please contact us.",
    },
    included: [
      ["GSTR-1 (Monthly)", "11th of the following month"],
      ["GSTR-1 (Quarterly, QRMP Scheme)", "13th of the month following the quarter"],
      ["GSTR-3B (Monthly)", "20th of the following month"],
      [
        "GSTR-3B (Quarterly, QRMP Scheme)",
        "22nd or 24th of the month following the quarter, depending on the state/UT",
      ],
      ["GSTR-4 (Annually)", "30th June following the financial year"],
      ["GSTR-5 (Monthly, Non-Resident Taxable Persons)", "13th of the following month"],
      ["GSTR-6 (Monthly, Input Service Distributors)", "13th of the following month"],
      ["GSTR-7 (Monthly, TDS Deductors)", "10th of the following month"],
      ["GSTR-8 (Monthly, E-commerce Operators)", "10th of the following month"],
      [
        "GSTR-9 / GSTR-9C (Annually, where applicable)",
        "31st December following the financial year",
      ],
      [
        "GSTR-10 (Final Return)",
        "Within 3 months of the cancellation date or cancellation order, whichever is later",
      ],
      ["CMP-08 (Quarterly, Composition Scheme)", "18th of the month following the quarter"],
      [
        "ITC-04 (Half-yearly or annually, as applicable)",
        "25th April / 25th October, where applicable",
      ],
    ].map(([name, due]) => ({ name, description: `Due date: ${due}.` })),
    note: "Due dates may vary based on applicable GST provisions, taxpayer category, and notifications or extensions issued by the CBIC. Not every return applies to every taxpayer.",
  },

  "shop-and-establishment-registration": {
    overview:
      "Shop and Establishment registration requirements and government fees vary from state to state. The applicable charges may depend on the nature of the business, number of employees, type of establishment, and registration validity period.",
    pricing: {
      kind: "quote",
      text: "For an accurate quotation, please contact us with your business location and establishment details.",
    },
    included: [
      {
        name: "Government Fees",
        description:
          "Statutory charges payable to the relevant state authority, depending on the applicable rules and registration requirements.",
      },
      {
        name: "Professional Fees",
        description:
          "Charges for professional assistance with documentation, application preparation, filing, and follow-up with the concerned authority.",
      },
    ],
    note: "Government fees and professional fees are separate. Applicable government charges, additional expenses, and GST, where applicable, will be communicated based on the requirements of your registration.",
  },

  "iec-registration": {
    overview:
      "An Import Export Code (IEC) is generally required for businesses engaged in importing or exporting goods from India, subject to applicable exemptions. It is issued by the Directorate General of Foreign Trade (DGFT).",
    pricing: {
      kind: "from",
      amount: 1000,
      rows: [
        { label: "Professional fee (indicative)", value: "₹1,000–₹5,000" },
        { label: "New IEC application (government fee)", value: "₹500" },
        { label: "IEC modification (government fee)", value: "₹200" },
        { label: "Annual IEC update (April–June)", value: "₹0" },
        { label: "Late annual IEC update", value: "₹200" },
        { label: "Digital Signature Certificate (if used)", value: "₹1,500–₹3,000" },
      ],
    },
    notIncluded:
      "Government fees and professional fees are charged separately. DSC charges, if required, are additional.",
    included: [
      {
        name: "Documentation Assistance",
        description: "Guidance on preparing the required business and identity documents.",
      },
      {
        name: "IEC Application Filing",
        description:
          "Assistance with completing and submitting the online application through the DGFT portal.",
      },
      {
        name: "Application Review",
        description: "Checking the application and supporting documents for completeness.",
      },
      {
        name: "Modification Assistance",
        description: "Support with updating IEC details, where required.",
      },
      {
        name: "Annual Update Guidance",
        description: "Assistance with the mandatory annual IEC update, where applicable.",
      },
    ],
    note: "The applicable government fee and requirements should be confirmed against the latest DGFT rules before filing.",
  },

  "iso-certification": {
    overview:
      "ISO certification costs in India vary depending on the ISO standard, organisation size, business activities, certification scope, number of locations, and certification body.",
    pricing: {
      kind: "quote",
      text: "For pricing and a customised quotation, please contact us with your business details and the ISO standard you wish to obtain.",
    },
    included: [
      { name: "ISO 9001", description: "Quality Management System." },
      { name: "ISO 22301", description: "Business Continuity Management." },
      { name: "ISO 13485", description: "Medical Devices Quality Management." },
      { name: "ISO/IEC 27001", description: "Information Security Management." },
      { name: "ISO 42001", description: "Artificial Intelligence Management System." },
    ],
    note: "ISO certification is generally issued by an independent certification body. Verify the certification body’s accreditation and the applicable certification scope before proceeding. Certification is subject to the relevant audit and requirements.",
  },

  "rera-registration": {
    overview:
      "Real Estate Regulatory Authority (RERA) registration requirements and fees vary by state and depend on the type of registration, such as real estate project registration, real estate agent registration, or project extension.",
    pricing: {
      kind: "quote",
      text: "For exact pricing, please contact us with your state, registration type, and project or business details.",
    },
    included: [
      {
        name: "Real Estate Project Registration",
        description:
          "Registration for eligible real estate projects with the respective state RERA authority.",
      },
      {
        name: "Real Estate Agent Registration",
        description:
          "Registration for individuals or entities facilitating real estate transactions where required.",
      },
      {
        name: "Project Extension",
        description:
          "Application for an extension of a registered real estate project, subject to applicable rules.",
      },
      {
        name: "RERA Compliance Assistance",
        description:
          "Assistance with applicable filings, documentation, and compliance requirements.",
      },
    ],
    note: "All fees are subject to the applicable state RERA rules and current fee schedules. Registration and approvals are subject to eligibility, documentation, and the decision of the relevant authority.",
  },

  "startup-india-dpiit-recognition": {
    overview:
      "Get professional assistance with applying for DPIIT Recognition under the Startup India initiative, including application support and access to the official Certificate of Recognition upon successful approval.",
    pricing: {
      kind: "fixed",
      amount: 4000,
      rows: [
        { label: "Professional fee", value: "₹4,000" },
        { label: "Government application fee", value: "Generally ₹0" },
      ],
    },
    notIncluded:
      "Applicable GST, if any. Additional services, extensive documentation, or separate registrations and benefits are quoted separately.",
    included: [
      {
        name: "Eligibility Assessment",
        description:
          "Preliminary review of your business structure, incorporation details, and eligibility for DPIIT recognition.",
      },
      {
        name: "Document Checklist",
        description:
          "Guidance on preparing the required business documents and supporting information.",
      },
      {
        name: "Application Preparation",
        description:
          "Assistance with preparing the application and business details for submission.",
      },
      {
        name: "DPIIT Recognition Application",
        description:
          "Support with filing the application through the official Startup India portal.",
      },
      {
        name: "Business Profile Assistance",
        description:
          "Guidance on presenting your business model, innovation, scalability, or improvement in products, services, or processes, as applicable.",
      },
      {
        name: "Certificate of Recognition",
        description:
          "Assistance with accessing and obtaining the DPIIT Recognition Certificate after successful approval.",
      },
      {
        name: "Application Status Guidance",
        description: "Assistance with tracking the application and understanding status updates.",
      },
    ],
    note: "DPIIT recognition and issuance of the Certificate of Recognition are subject to eligibility and approval by the competent authority. Payment of the professional fee does not guarantee recognition. Other registrations, licences, tax exemptions, and startup benefits may require separate applications and approvals.",
  },

  "trademark-registration": {
    overview:
      "Protect your brand name, logo, or business identity with trademark registration assistance. Our service includes application preparation, trademark class guidance, and filing support with the appropriate Trade Marks Registry.",
    pricing: {
      kind: "fixed",
      amount: 2499,
      suffix: "+ government fee",
      rows: [
        { label: "Professional fee (per application)", value: "₹2,499" },
        { label: "Government fee", value: "As applicable" },
      ],
    },
    notIncluded:
      "The government filing fee, which depends on the applicant’s category. Replying to examination objections, handling oppositions, hearings, and appeals may attract additional professional fees.",
    included: [
      {
        name: "Trademark Availability Search",
        description:
          "Preliminary assistance with checking the availability of your proposed brand name or logo.",
      },
      {
        name: "Trademark Class Identification",
        description:
          "Guidance on selecting the appropriate trademark class based on your goods or services.",
      },
      {
        name: "Application Preparation",
        description: "Preparation of the trademark application and required details.",
      },
      {
        name: "Trademark Application Filing",
        description: "Filing assistance with the Trade Marks Registry.",
      },
      {
        name: "Application Acknowledgement",
        description: "Sharing the application details and acknowledgement after successful filing.",
      },
      {
        name: "Basic Status Guidance",
        description: "Guidance on checking application status and understanding routine updates.",
      },
    ],
    note: "Trademark registration is subject to examination, possible objections or oppositions, and approval by the Trade Marks Registry. Filing an application does not guarantee registration.",
  },
};

export function getServiceDetail(slug: string): ServiceDetail {
  const detail = serviceDetails[slug];
  if (!detail) throw new Error(`No service details for "${slug}"`);
  return detail;
}

export const planNames: Record<PlanId, string> = Object.fromEntries(
  PLANS.map((p) => [p.id, p.name]),
) as Record<PlanId, string>;
