import { css } from "#/styled-system/css";

const containerStyle = css({
  marginTop: 16,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 8,
});

const textPrimeStyle = css({
  fontSize: "2xl",
  fontWeight: "bold",
  textAlign: "center",
});

const textSubStyle = css({
  fontWeight: "semibold",
  color: "gray.600",
});

export const NameOrigin = () => (
  <div className={containerStyle}>
    <div>
      <div className={textPrimeStyle}>Asahi</div>
      <div className={textSubStyle}>My first name</div>
    </div>
    <div className={textPrimeStyle}>+</div>
    <div>
      <div className={textPrimeStyle}>&quot;1984&quot;</div>
      <div className={textSubStyle}>George Orwell&apos;s novel</div>
    </div>
  </div>
);
