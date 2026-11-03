import { css } from "#/styled-system/css";

const logoStyle = css({
  fontSize: "2xl",
  fontWeight: "extrabold",
  userSelect: "none",
});

const headerStyle = css({
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

const containerStyle = css({
  display: "grid",
  gridTemplateRows: "auto 1fr auto",
  gridTemplateColumns: "100%",
  minHeight: "100vh",
});

const mainStyle = css({
  margin: "0 auto",
  px: 4,
  width: "100%",
  maxWidth: "4xl",
});

const footerStyle = css({
  marginX: "auto",
  marginTop: 16,
  marginBottom: 6,
  textAlign: "center",
  fontSize: "md",
  fontWeight: "semibold",
  color: "gray.600",
});

/**
 * The header, main, and footer of every page under (routes).
 *
 * It is a component rather than a Void layout because islands only hydrate when a page imports
 * them: each page imports its NavMenu island and passes it in as `nav`.
 */
export const RoutesLayout = ({
  nav,
  children,
}: {
  nav: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className={containerStyle}>
    <header>
      <nav>
        <ul className={headerStyle}>
          <li>
            <a href="/">
              <div className={logoStyle}>TrashBox</div>
            </a>
          </li>
          <li>{nav}</li>
        </ul>
      </nav>
    </header>
    <main className={mainStyle}>{children}</main>
    <footer className={footerStyle}>
      <p>© 2023 asa1984</p>
    </footer>
  </div>
);
