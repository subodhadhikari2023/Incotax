"use client";

import { useState } from "react";

import { forms } from "@/content/pages";
import { servicesByCategory } from "@/content/services";
import { site } from "@/content/site";
import {
  enquiryMessage,
  validateEnquiry,
  type EnquiryErrors,
  type EnquiryValues,
} from "@/lib/enquiry";
import { whatsappLink } from "@/lib/whatsapp";

const empty: EnquiryValues = { name: "", mobile: "", email: "", service: "", message: "" };

// Enquiry form used by the pop-up and the Contact page. On a valid submit it opens WhatsApp with
// the details pre-filled and shows the after-submit message.
export function EnquiryForm({
  idPrefix,
  label = "Enquiry form",
  withMessage = false,
  compact = false,
  twoColumns = false,
  note = forms.note,
}: {
  idPrefix: string;
  label?: string;
  withMessage?: boolean;
  compact?: boolean;
  twoColumns?: boolean;
  note?: string;
}) {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const set = (key: keyof EnquiryValues) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validateEnquiry(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    window.open(
      whatsappLink(site.whatsappNumber, enquiryMessage(values)),
      "_blank",
      "noopener,noreferrer",
    );
    setSubmitted(true);
  }

  const field = `w-full rounded-lg border border-border-field bg-white px-3.5 text-base text-navy placeholder:text-text-muted focus:border-navy focus:outline-2 focus:outline-gold ${
    compact ? "h-12" : "h-[50px]"
  }`;
  const labelClass = "mb-1.5 block text-sm font-semibold text-navy";
  const errorId = (key: string) => `${idPrefix}-${key}-error`;
  const errorText = (key: keyof EnquiryValues) =>
    errors[key] && (
      <p id={errorId(key)} className="mt-1.5 text-sm text-error">
        {errors[key]}
      </p>
    );
  const invalid = (key: keyof EnquiryValues) =>
    errors[key] ? { "aria-invalid": true, "aria-describedby": errorId(key) } : {};

  return (
    <form aria-label={label} noValidate onSubmit={onSubmit}>
      <div className={`grid gap-4 ${twoColumns ? "md:grid-cols-2 md:gap-x-5" : ""}`}>
        <div>
          <label htmlFor={`${idPrefix}-name`} className={labelClass}>
            Full Name*
          </label>
          <input
            id={`${idPrefix}-name`}
            className={field}
            required
            autoComplete="name"
            placeholder="Your full name"
            value={values.name}
            onChange={set("name")}
            {...invalid("name")}
          />
          {errorText("name")}
        </div>
        <div>
          <label htmlFor={`${idPrefix}-mobile`} className={labelClass}>
            Mobile Number*
          </label>
          <input
            id={`${idPrefix}-mobile`}
            className={field}
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="10-digit mobile number"
            value={values.mobile}
            onChange={set("mobile")}
            {...invalid("mobile")}
          />
          {errorText("mobile")}
        </div>
        <div>
          <label htmlFor={`${idPrefix}-email`} className={labelClass}>
            Email
          </label>
          <input
            id={`${idPrefix}-email`}
            className={field}
            type="email"
            autoComplete="email"
            placeholder="Email address"
            value={values.email}
            onChange={set("email")}
            {...invalid("email")}
          />
          {errorText("email")}
        </div>
        <div>
          <label htmlFor={`${idPrefix}-service`} className={labelClass}>
            Select Service
          </label>
          <select
            id={`${idPrefix}-service`}
            className={field}
            value={values.service}
            onChange={set("service")}
          >
            <option value="">Choose a service</option>
            {servicesByCategory.map((category) => (
              <optgroup key={category.id} label={category.name}>
                {category.services.map((service) => (
                  <option key={service.slug} value={service.shortName ?? service.name}>
                    {service.shortName ?? service.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        {withMessage && (
          <div className={twoColumns ? "md:col-span-2" : ""}>
            <label htmlFor={`${idPrefix}-message`} className={labelClass}>
              Message
            </label>
            <textarea
              id={`${idPrefix}-message`}
              rows={4}
              className={`${field} h-auto py-3`}
              placeholder="How can we help?"
              value={values.message}
              onChange={set("message")}
            />
          </div>
        )}
      </div>

      <div
        className={`mt-6 flex flex-col gap-4 ${twoColumns ? "md:flex-row md:items-center md:gap-5" : ""}`}
      >
        <button
          type="submit"
          className={`rounded-lg bg-gold px-7 py-3.5 text-base font-semibold text-navy shadow-button transition-colors hover:bg-gold-arrow ${
            twoColumns ? "md:w-auto" : "w-full"
          }`}
        >
          {forms.submitLabel}
        </button>
        <p className={`text-[13px] text-text-muted ${twoColumns ? "" : "text-center"}`}>{note}</p>
      </div>

      {submitted && (
        <p role="status" className="mt-5 rounded-lg bg-gold-tint px-4 py-3 text-[15px] text-navy">
          {forms.afterSubmit}
        </p>
      )}
    </form>
  );
}
