import type { Metadata } from "next";
import { css } from "@/styled-system/css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Not Found",
  description: "Not Found",
};

const container_style = css({
  height: "100vh",
  display: "grid",
  placeItems: "center",
});
const h1_style = css({
  fontSize: "8xl",
  fontWeight: "bold",
  textAlign: "center",
  lineHeight: "none",
});
const emoji_style = css({
  marginTop: 8,
  fontSize: "8xl",
  fontWeight: "bold",
  textAlign: "center",
});
const text_style = css({
  marginTop: 8,
  fontSize: "xl",
  textAlign: "center",
  textDecoration: "underline",
});

export default function NotFound() {
  return (
    <div className={container_style}>
      <div>
        <h1 className={h1_style}>Not Found</h1>
        <p className={emoji_style}>👺</p>
        <p className={text_style}>
          <Link href="/">Get Back!</Link>
        </p>
      </div>
    </div>
  );
}
