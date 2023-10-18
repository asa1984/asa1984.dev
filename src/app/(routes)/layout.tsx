import Link from "next/link";

import { css } from "@/styled-system/css";

const Header = () => {
  const Logo = () => (
    <Link href="/">
      <div
        className={css({
          fontSize: "3xl",
          fontWeight: "extrabold",
          userSelect: "none",
        })}
      >
        TrashBox
      </div>
    </Link>
  );

  const LinkButton = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <Link
      href={href}
      className={css({
        paddingX: 4,
        paddingY: 2,
        transitionDuration: "0.2s",
        transitionTimingFunction: "ease-out",
        borderRadius: {
          base: 64,
          _hover: "xl",
        },
        fontSize: "lg",
        fontWeight: "semibold",
        backgroundColor: "black",
        color: "white",
        userSelect: "none",
      })}
    >
      {children}
    </Link>
  );

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

  const link_container_style = css({
    display: "flex",
    flexDir: "row",
    alignItems: "center",
    gap: 2,
  });

  return (
    <header>
      <nav>
        <ul className={container_style}>
          <li>
            <Logo />
          </li>
          <ul className={link_container_style}>
            <li>
              <LinkButton href="/context">Context</LinkButton>
            </li>
            <li>
              <LinkButton href="/profile">Profile</LinkButton>
            </li>
          </ul>
        </ul>
      </nav>
    </header>
  );
};

const Footer = () => {
  const footer_style = css({
    marginX: "auto",
    marginTop: 16,
    marginBottom: 6,
    textAlign: "center",
    fontSize: "md",
    fontWeight: "semibold",
    color: "gray.600",
  });

  return (
    <footer className={footer_style}>
      <p>© 2023 asa1984</p>
    </footer>
  );
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const container_style = css({
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
    gridTemplateColumns: "100%",
    minHeight: "100vh",
  });

  const main_container_style = css({
    margin: "0 auto",
    px: 4,
    width: "100%",
    maxWidth: "4xl",
  });

  return (
    <div className={container_style}>
      <Header />
      <main className={main_container_style}>{children}</main>
      <Footer />
    </div>
  );
}
