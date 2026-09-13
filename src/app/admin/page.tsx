import Image from "next/image";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { isAdminConfigured } from "@/lib/admin-auth";
import { isAdminRequest } from "@/lib/admin-guard";

export default async function AdminLoginPage() {
  if (await isAdminRequest()) redirect("/admin/orders");

  return (
    <div className="tile-grid flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-[28px] border border-grout bg-porcelain p-8 shadow-lift">
        <Image src="/brand/sanlux-logo.png" alt="SanLux" width={205} height={51} className="h-9 w-auto" priority />
        <h1 className="mt-6 text-2xl font-semibold">Вход в админку</h1>
        {isAdminConfigured() ? (
          <LoginForm />
        ) : (
          <p className="mt-4 text-ink-soft">
            Пароль не задан. Добавьте <code className="font-mono text-sm">ADMIN_PASSWORD</code> в <code className="font-mono text-sm">.env.local</code> и перезапустите сервер.
          </p>
        )}
      </div>
    </div>
  );
}
