import { css } from "@/styled-system/css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <article
      className={css({
        mx: "auto",
        maxW: "75ch",
      })}
    >
      {children}
    </article>
  );
}
