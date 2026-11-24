import type { Metadata } from "next";
import { Instrument_Serif, Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ThayyibLandingPage } from "@/components/thayyib-landing-page";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: "400",
  variable: "--font-instrument-serif",
});

export const metadata: Metadata = {
  title: "Thayyib | Halal Compliance Intelligence",
  description:
    "AI-powered halal compliance management for food manufacturers.",
};

export default function LandingPage() {
  return (
    <ThayyibLandingPage
      fontClassName={`${inter.variable} ${plusJakarta.variable} ${instrumentSerif.variable}`}
    />
  );
}
