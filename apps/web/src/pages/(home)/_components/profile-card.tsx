import { css } from "#/styled-system/css";

const containerStyle = css({
  marginTop: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
});

const imageStyle = css({
  backgroundColor: "white",
  overflow: "hidden",
  borderRadius: "xl",
  border: "3px solid",
  borderColor: "black",
});

const h1Style = css({
  fontSize: "5xl",
  fontWeight: "extrabold",
});

const textSubStyle = css({
  fontWeight: "semibold",
  color: "gray.600",
});

export const ProfileCard = () => (
  <div className={containerStyle}>
    <img
      src="/images/asa1984.webp"
      width={128}
      height={128}
      alt="asa1984's icon"
      fetchPriority="high"
      decoding="async"
      className={imageStyle}
    />
    <div>
      <h1 className={h1Style}>asa1984</h1>
      <p className={textSubStyle}>he/him | 2004-present</p>
    </div>
  </div>
);
