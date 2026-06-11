"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function AdminNav({ name }: { name: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const links = [
    { href: "/admin", label: "Calendario" },
    { href: "/admin/pacientes", label: "Pacientes" },
  ];

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-lg font-bold text-primary">
            🐾 Antonia Vet · Panel
          </Link>
          <nav className="flex gap-4 text-sm font-medium">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`hover:text-primary ${
                  pathname === link.href ? "text-primary" : "text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted">{name}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-border px-4 py-1.5 font-medium hover:border-primary hover:text-primary"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
