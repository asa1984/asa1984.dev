import "./globals.css";
import type { Metadata } from "next";
import { SansEN, SansJP, Monospace } from "@/styles/fonts";

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
    <html
      lang="ja"
      className={`${SansEN.variable} ${SansJP.variable} ${Monospace.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
