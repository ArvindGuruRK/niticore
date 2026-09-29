import { JetBrains_Mono, Manrope, Sora } from "next/font/google";

/**
 * The site's three typefaces, shared by the site layout and the global 404 (which renders its own
 * <html>). Sora for display, Manrope for body, JetBrains Mono for terminal text.
 */
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

// Terminal text only (LogStream) and code in articles, so it is not preloaded on every page
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

/** Put on <html> */
export const FONT_VARIABLES = `${sora.variable} ${manrope.variable} ${jetbrainsMono.variable}`;
