import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/LoginForm";
import { isLoggedIn } from "@/lib/admin/auth";

export default async function AdminLoginPage() {
  if (await isLoggedIn()) redirect("/admin");

  return (
    <main className="flex flex-1 items-center justify-center px-5 py-16">
      <div className="w-full max-w-md rounded-[20px] bg-white p-8 shadow-card">
        <h1 className="text-[34px]/[40px] text-navy">Admin login</h1>
        <LoginForm />
      </div>
    </main>
  );
}
