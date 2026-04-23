import type { Metadata } from "next";
import { plantin, brandon } from "./fonts";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

export const metadata: Metadata = {
  title: "ĒTHA — Ancient Wisdom for Modern Living",
  description:
    "Discover your Dosha and unlock personalised Ayurvedic rituals for health, happiness, and harmony. 5,000 years of wisdom, made modern.",
  openGraph: {
    title: "ĒTHA — Ancient Wisdom for Modern Living",
    description:
      "Discover your Dosha and unlock personalised Ayurvedic rituals for health, happiness, and harmony.",
    siteName: "ĒTHA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plantin.variable} ${brandon.variable} antialiased`}
      suppressHydrationWarning
    >
      <body>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
