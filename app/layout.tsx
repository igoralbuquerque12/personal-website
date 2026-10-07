import type { Metadata } from "next";
import { Syne, DM_Mono, DM_Sans } from "next/font/google";
import "./globals.css";
import "./portfolio.css";
import "./responsive.css";
import "./ecosystem.css";

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
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.igoralbuquerque.site"),
  title: "Igor Albuquerque — Engenharia de Software, Backend & Cloud",
  description:
    "Backend, arquitetura de software e IA aplicados a problemas reais. Conheça a trajetória e os projetos de Igor Albuquerque: sistemas distribuídos, produtos SaaS e cloud.",
  icons: {
    icon: "/brand/icon.svg",
  },
  keywords: [
    "Igor Albuquerque",
    "Desenvolvedor Fullstack",
    "React",
    "Next.js",
    "NestJS",
    "TypeScript",
    "Portfolio",
    "Backend",
    "Arquitetura de Software",
    "AWS",
    "System Design",
  ],
  openGraph: {
    title:
      "Igor Albuquerque — Construí cada um. Depois, fiz eles trabalharem juntos.",
    description:
      "Engenharia de Software · Backend · Cloud · Inteligência Artificial. Explore os projetos e as decisões técnicas por trás de cada entrega.",
    locale: "pt_BR",
    type: "website",
    url: "https://www.igoralbuquerque.site",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${syne.variable} ${dmMono.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
