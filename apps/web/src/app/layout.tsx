import type { Metadata } from "next";

import { env } from "#/libs/env.ts";

import "./globals.css";
import "@fontsource-variable/inter/index.css";
import "@fontsource-variable/jetbrains-mono/index.css";
import "@fontsource-variable/noto-emoji/index.css";

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

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="ja">
    <body>{children}</body>
  </html>
);

export default RootLayout;
