import "./globals.css";
import type { Metadata } from "next";
import { SansSerifEn, SansSerifJp, Monospace } from "@/config/fonts";

export const metadata: Metadata = {
  title: "asa1984.dev",
  description: "asa1984's personal website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ja"
      className={`${SansSerifEn.variable} ${SansSerifJp.variable} ${Monospace.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
