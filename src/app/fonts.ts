import { Instrument_Serif, JetBrains_Mono, Space_Grotesk, Syne } from "next/font/google";

/**
 * ANIRX type system
 * display — Syne:        huge identity typography (ANIRUDH SHARMA, section titles)
 * sans    — Space Grotesk: body / UI
 * mono    — JetBrains Mono: metadata, labels, technical captions
 * edit    — Instrument Serif: editorial italic accents ("curious", captions)
 */
export const fontDisplay = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

export const fontSans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbmono",
  display: "swap",
});

export const fontEdit = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

export const fontVariables = [
  fontDisplay.variable,
  fontSans.variable,
  fontMono.variable,
  fontEdit.variable,
].join(" ");
