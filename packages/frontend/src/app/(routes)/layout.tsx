import Link from "next/link";
import { NavMenu } from "./_components/NavMenu";
import { css } from "@/styled-system/css";

const HeaderLogo = () => (
  <Link href="/">
    <div
      className={css({
        fontSize: "2xl",
        fontWeight: "extrabold",
        userSelect: "none",
      })}
    >
      TrashBox
    </div>
  </Link>
);

const Header = () => {
  const container_style = css({
    marginTop: 4,
    marginX: "auto",
    maxWidth: "4xl",
    display: "flex",
    flexDir: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 1rem",
    height: "3rem",
  });

  return (
    <header>
      <nav>
        <ul className={container_style}>
          <li>
            <HeaderLogo />
          </li>
          <li>
            <NavMenu />
          </li>
        </ul>
      </nav>
    </header>
  );
};

const container_style = css({
  display: "grid",
  gridTemplateRows: "auto 1fr auto",
  gridTemplateColumns: "100%",
  minHeight: "100vh",
});

const main_style = css({
  margin: "0 auto",
  px: 4,
  width: "100%",
  maxWidth: "4xl",
});

const footer_style = css({
  marginX: "auto",
  marginTop: 16,
  marginBottom: 6,
  textAlign: "center",
  fontSize: "md",
  fontWeight: "semibold",
  color: "gray.600",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={container_style}>
      <Header />
      <main className={main_style}>{children}</main>
      <footer className={footer_style}>
        <p>© 2023 asa1984</p>
      </footer>
    </div>
  );
}
