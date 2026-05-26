import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/ThemeProvider";
import StorefrontShell from "@/components/layout/StorefrontShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bellalure — La mode et les tendances du monde entier",
  description:
    "Boutique en ligne premium — Mode femme & homme, chaussures, sacs et accessoires livrés à Kinshasa et partout dans le monde.",
  keywords: [
    "mode",
    "fashion",
    "Kinshasa",
    "RDC",
    "chaussures",
    "sacs",
    "accessoires",
    "Bellalure",
  ],
  openGraph: {
    title: "Bellalure — La mode et les tendances du monde entier",
    description:
      "Boutique en ligne premium — Mode femme & homme, chaussures, sacs et accessoires livrés à Kinshasa et partout dans le monde.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${playfair.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col">
        <ThemeProvider>
          <StorefrontShell>{children}</StorefrontShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
