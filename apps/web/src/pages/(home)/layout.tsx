import { css } from "#/styled-system/css";

const containerStyle = css({
  display: "grid",
  gridTemplateRows: "1fr auto",
  gridTemplateColumns: "100%",
  minHeight: "100vh",
});

const mainContainerStyle = css({
  margin: "auto",
  width: "100%",
  maxWidth: "4xl",
  padding: "1rem",
});

const footerStyle = css({
  marginX: "auto",
  marginTop: 16,
  marginBottom: 8,
  textAlign: "center",
  fontSize: "md",
  fontWeight: "semibold",
  color: "gray.600",
});

const HomeLayout = ({ children }: { children: React.ReactNode }) => (
  <div className={containerStyle}>
    <main className={mainContainerStyle}>{children}</main>
    <footer className={footerStyle}>
      <p>© 2023 asa1984</p>
    </footer>
  </div>
);

export default HomeLayout;
