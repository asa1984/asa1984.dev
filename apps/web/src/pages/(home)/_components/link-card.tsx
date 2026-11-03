import { css } from "#/styled-system/css";

export type CardProps = {
  title: React.ReactNode;
  href: string;
  description?: React.ReactNode;
};

const containerStyle = css({
  display: "block",
  padding: 8,
  aspectRatio: "2/1",
  backgroundColor: "white",
  border: "3px solid",
  borderRadius: "xl",
  transitionDuration: "0.2s",
  transitionTimingFunction: "ease-out",
  boxShadow: {
    base: "4px 4px 0 0 var(--colors-black)",
    _hover: "8px 8px 0 0 var(--colors-black)",
  },
  "@media (max-width: 768px)": {
    padding: 4,
    aspectRatio: "auto",
  },
});

const titleStyle = css({
  fontSize: "4xl",
  fontWeight: "bold",
});

const descriptionStyle = css({
  marginTop: 3,
  fontSize: "lg",
  fontWeight: "semibold",
  color: "gray.600",
});

export const LinkCard = ({ title, href, description }: CardProps) => (
  <a href={href} className={containerStyle}>
    <p className={titleStyle}>{title}</p>
    <p className={descriptionStyle}>{description}</p>
  </a>
);
