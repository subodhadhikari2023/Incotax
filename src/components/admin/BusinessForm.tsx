"use client";

import { useActionState } from "react";

import { saveBusinessDetails } from "@/app/admin/business/actions";
import type { BusinessField, BusinessFormValues } from "@/lib/business";

const fields: {
  name: BusinessField;
  label: string;
  type?: string;
  hint?: string;
  multiline?: boolean;
}[] = [
  { name: "phone", label: "Phone", type: "tel" },
  {
    name: "whatsappNumber",
    label: "WhatsApp number",
    type: "tel",
    hint: "With the country code, for example 91 and then the 10-digit number.",
  },
  { name: "email", label: "Email", type: "email" },
  { name: "address", label: "Office address", multiline: true },
  { name: "hours", label: "Hours", hint: "Working days and times, as visitors should read them." },
];

const fieldClass =
  "w-full rounded-lg border border-border-field bg-white px-3.5 text-base text-navy focus:border-navy focus:outline-2 focus:outline-gold";

// noValidate: the Server Action checks every field and shows its messages in the same way.
export function BusinessForm({ initial }: { initial: BusinessFormValues }) {
  const [state, action, pending] = useActionState(saveBusinessDetails, undefined);
  const values = state?.values ?? initial;

  return (
    <form action={action} noValidate className="mt-8 max-w-[720px] space-y-5">
      {fields.map(({ name, label, type = "text", hint, multiline }) => {
        const id = `business-${name}`;
        const error = state?.errors[name];
        const described = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ");
        const props = {
          id,
          name,
          defaultValue: values[name],
          "aria-invalid": error ? true : undefined,
          "aria-describedby": described || undefined,
        };
        return (
          <div key={name}>
            <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-navy">
              {label}
            </label>
            {multiline ? (
              <textarea {...props} rows={3} className={`${fieldClass} py-3`} />
            ) : (
              <input {...props} type={type} className={`${fieldClass} h-[50px]`} />
            )}
            {hint && (
              <p id={`${id}-hint`} className="mt-1.5 text-sm text-text-muted">
                {hint}
              </p>
            )}
            {error && (
              <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-error">
                {error}
              </p>
            )}
          </div>
        );
      })}

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-gold px-7 py-3.5 text-base font-semibold text-navy shadow-button transition-colors hover:bg-gold-arrow disabled:opacity-70"
        >
          Save
        </button>
        {state?.saved && (
          <p role="status" className="text-[15px] font-semibold text-navy">
            Saved. The public pages now show these details.
          </p>
        )}
        {state?.error && (
          <p role="alert" className="text-[15px] text-error">
            {state.error}
          </p>
        )}
      </div>
    </form>
  );
}
