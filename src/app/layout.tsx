import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/chrome/Nav";
import { site } from "@/content/site";
import { SmoothScroll } from "@/motion/SmoothScroll";
import { fontVariables } from "./fonts";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "ANIRX — ANIRUDH SHARMA",
    template: "%s — ANIRX",
  },
  description: site.description,
  keywords: ["Anirudh Sharma", "Creative Technologist", "ANIRX", "filmmaking", "editing", "code"],
  authors: [{ name: site.owner, url: site.url }],
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title: "ANIRX — ANIRUDH SHARMA",
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "ANIRX — ANIRUDH SHARMA",
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#08090b",
  colorScheme: "dark light",
};

/** Set the stored DAY/NIGHT mode before first paint to avoid a flash. */
const modeBootstrap = `(function(){try{var m=window.localStorage.getItem("anirx-mode");if(m==="day"||m==="night"){document.documentElement.dataset.mode=m;}else{document.documentElement.dataset.mode="night";}}catch(e){document.documentElement.dataset.mode="night";}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-mode="night"
      suppressHydrationWarning
      className={`${fontVariables} h-full`}
    >
      <body className="min-h-full">
        <script dangerouslySetInnerHTML={{ __html: modeBootstrap }} />
        <SmoothScroll />
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
