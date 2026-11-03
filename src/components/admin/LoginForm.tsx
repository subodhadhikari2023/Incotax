"use client";

import { useActionState } from "react";

import { login } from "@/app/admin/actions";

// Password form for the admin panel; the Server Action checks the password and sets the cookie.
export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="mt-6">
      <label htmlFor="admin-password" className="mb-1.5 block text-sm font-semibold text-navy">
        Password
      </label>
      <input
        id="admin-password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        className="h-[50px] w-full rounded-lg border border-border-field bg-white px-3.5 text-base text-navy focus:border-navy focus:outline-2 focus:outline-gold"
        {...(state?.error
          ? { "aria-invalid": true, "aria-describedby": "admin-password-error" }
          : {})}
      />
      {state?.error && (
        <p id="admin-password-error" role="alert" className="mt-1.5 text-sm text-error">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-6 w-full rounded-lg bg-gold px-7 py-3.5 text-base font-semibold text-navy shadow-button transition-colors hover:bg-gold-arrow disabled:opacity-70"
      >
        Log in
      </button>
    </form>
  );
}
