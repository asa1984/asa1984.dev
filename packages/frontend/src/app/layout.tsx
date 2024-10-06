import { env } from "@/libs/env";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import type { Metadata } from "next";

import "./globals.css";
import "@fontsource-variable/inter";
import "@fontsource-variable/noto-sans-jp";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/noto-emoji";

export const metadata: Metadata = {
  title: "asa1984.dev",
  description: "asa1984's personal website",
  openGraph: {
    title: "asa1984.dev",
    description: "asa1984's personal website",
  },
  twitter: {
    card: "summary",
  },

  metadataBase: new URL(
    (() => {
      switch (env.NODE_ENV) {
        case "production":
          return "https://asa1984.dev";
        default:
          return "http://localhost:3000";
      }
    })(),
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
      <Analytics />
      <SpeedInsights />
    </html>
  );
}
