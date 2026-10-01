import type { Metadata } from "next";
import type { ReactElement } from "react";
import { Sora, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// Vercel sets this system env var on deploys; fall back to local dev for absolute OG URLs.
const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const metadata: Metadata = {
  metadataBase: new URL(productionHost ? `https://${productionHost}` : "http://localhost:3000"),
  title: "Mohamed Ismail — Full-Stack Engineer",
  description:
    "Full-stack engineer in Cairo. I connect what you need with the tech that gets it done, across web, mobile, enterprise and AI.",
};

export default function RootLayout({ children }: LayoutProps<"/">): ReactElement {
  return (
    <html lang="en" className={`${sora.variable} ${manrope.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
