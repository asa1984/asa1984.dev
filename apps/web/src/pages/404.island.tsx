import { css } from "#/styled-system/css";

const containerStyle = css({
  height: "100vh",
  display: "grid",
  placeItems: "center",
});
const h1Style = css({
  fontSize: "8xl",
  fontWeight: "bold",
  textAlign: "center",
  lineHeight: "none",
});
const emojiStyle = css({
  marginTop: 8,
  fontSize: "8xl",
  fontWeight: "bold",
  textAlign: "center",
});
const textStyle = css({
  marginTop: 8,
  fontSize: "xl",
  textAlign: "center",
  textDecoration: "underline",
});

/** Prerendered into 404.html, which is served with a 404 status for every unknown URL. */
const NotFoundPage = () => (
  <div className={containerStyle}>
    <div>
      <h1 className={h1Style}>Not Found</h1>
      <p className={emojiStyle}>👺</p>
      <p className={textStyle}>
        <a href="/">Get Back!</a>
      </p>
    </div>
  </div>
);

export default NotFoundPage;
