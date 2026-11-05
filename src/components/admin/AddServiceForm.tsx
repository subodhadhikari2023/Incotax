"use client";

import { useActionState } from "react";

import { createService } from "@/app/admin/services/catalog-actions";
import { serviceCategories } from "@/content/services";

const field =
  "w-full rounded-lg border border-border-field bg-white px-3.5 text-base text-navy focus:border-navy focus:outline-2 focus:outline-gold";

// Starts a new service as a draft, then opens it on the page design to fill in.
export function AddServiceForm() {
  const [state, action, pending] = useActionState(createService, undefined);
  const errors = state?.errors ?? {};

  return (
    <form
      action={action}
      noValidate
      className="mt-6 grid items-start gap-4 rounded-[14px] border border-border bg-white p-5 shadow-card md:grid-cols-[1fr_1fr_auto]"
    >
      <div>
        <label
          htmlFor="new-service-name"
          className="mb-1.5 block text-[15px] font-semibold text-navy"
        >
          Name of the new service
        </label>
        <input
          id="new-service-name"
          name="name"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "new-service-name-error" : undefined}
          className={`${field} h-[50px]`}
        />
        {errors.name && (
          <p
            id="new-service-name-error"
            role="alert"
            className="mt-1.5 text-sm font-semibold text-error"
          >
            {errors.name}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="new-service-category"
          className="mb-1.5 block text-[15px] font-semibold text-navy"
        >
          Category
        </label>
        <select id="new-service-category" name="category" className={`${field} h-[50px]`}>
          {serviceCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.category && (
          <p role="alert" className="mt-1.5 text-sm font-semibold text-error">
            {errors.category}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-[50px] rounded-lg bg-gold px-6 text-base font-semibold text-navy shadow-button hover:bg-gold-arrow disabled:opacity-70 md:mt-[30px]"
      >
        Add service
      </button>
      <p className="text-sm text-text-muted md:col-span-3">
        It starts as a draft, so visitors won&apos;t see it until you publish it.
      </p>
    </form>
  );
}
