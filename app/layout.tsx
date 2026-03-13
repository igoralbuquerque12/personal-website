import type { Metadata } from "next";
import { Syne, DM_Mono, DM_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Igor Albuquerque — Desenvolvedor Fullstack",
  description:
    "Gosto de complexidade. Sistemas, regras de negócio, integrações.",
  keywords: [
    "Igor Albuquerque",
    "Desenvolvedor Fullstack",
    "React",
    "Next.js",
    "NestJS",
    "TypeScript",
    "Portfolio",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${syne.variable} ${dmMono.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
