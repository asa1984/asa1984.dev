import { css } from "@/styled-system/css";

type FeatureProps = {
  content: React.ReactNode;
  card: React.ReactNode;
  card_direction: "right" | "left";
};

export default ({ content, card, card_direction }: FeatureProps) => {
  const container_style = css({
    marginTop: 16,
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    alignItems: "center",
    gridGap: 16,
    "@media (max-width: 768px)": {
      gridTemplateColumns: "1fr",
      gridGap: 8,
    },
  });

  const content_style = css({
    order: card_direction === "right" ? "1" : "2",
    "@media (max-width: 768px)": {
      order: "1",
    },

    marginY: "auto",
    maxWidth: "xl",
    fontSize: "lg",
    "& h2": {
      fontSize: "3xl",
      fontWeight: "bold",
      marginBottom: 3,
    },
    "& h3": {
      fontSize: "2xl",
      fontWeight: "bold",
      marginY: 2,
    },
    "& ul": {
      marginBottom: 4,
      listStyleType: "initial",
    },
    "& li": {
      marginTop: 2,
      marginLeft: 6,
    },
    "& em": {
      fontWeight: "bold",
      fontStyle: "italic",
    },
    "& p": {
      marginTop: -1,
      marginBottom: 3,
    },
  });

  const card_style = css({
    order: card_direction === "right" ? "2" : "1",
    "@media (max-width: 768px)": {
      order: "2",
    },
  });

  return (
    <div className={container_style}>
      <div className={content_style}>{content}</div>
      <div className={card_style}>{card}</div>
    </div>
  );
};
