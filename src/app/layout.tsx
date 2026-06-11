import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Antonia Vet | Atención veterinaria a domicilio",
  description:
    "Agenda tu hora veterinaria a domicilio en simples pasos: elige día, hora, comuna y cuéntanos sobre tu mascota.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b border-border bg-card">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🐾</span>
              <span className="text-xl font-bold text-primary">Antonia Vet</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium">
              <Link href="/#servicios" className="hidden sm:inline hover:text-primary">
                Servicios
              </Link>
              <Link href="/#como-funciona" className="hidden sm:inline hover:text-primary">
                Cómo funciona
              </Link>
              <Link
                href="/agendar"
                className="rounded-full bg-primary px-4 py-2 text-white shadow-sm transition hover:bg-primary-dark"
              >
                Agendar hora
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
        <footer className="border-t border-border bg-card">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted sm:px-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p>© {new Date().getFullYear()} Antonia Vet. Todos los derechos reservados.</p>
              <div className="flex gap-4">
                <Link href="/agendar" className="hover:text-primary">
                  Agendar hora
                </Link>
                <Link href="/admin" className="hover:text-primary">
                  Acceso veterinaria
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
