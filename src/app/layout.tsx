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
      switch (process.env.DEPLOY_BRANCH) {
        case "main":
          return "https://asa1984.dev";
        case "dev":
          return "https://dev.trashbox.pages.dev";
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
    </html>
  );
}
