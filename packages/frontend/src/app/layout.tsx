import { env } from "@/libs/env";
import type { Metadata } from "next";

import "./globals.css";
import "@fontsource-variable/inter";
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
  metadataBase: new URL(env.FRONTEND_URL),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
