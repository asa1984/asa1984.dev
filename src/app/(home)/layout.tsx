import { css } from "@/styled-system/css";

const Footer = () => {
  const footer_style = css({
    marginX: "auto",
    marginTop: 16,
    marginBottom: 8,
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

export default ({ children }: { children: React.ReactNode }) => {
  const container_style = css({
    display: "grid",
    gridTemplateRows: "1fr auto",
    gridTemplateColumns: "100%",
    minHeight: "100vh",
  });

  const main_container_style = css({
    margin: "auto",
    width: "100%",
    maxWidth: "4xl",
    padding: "1rem",
  });

  return (
    <div className={container_style}>
      <main className={main_container_style}>{children}</main>
      <Footer />
    </div>
  );
};
