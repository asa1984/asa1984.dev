import { css } from "#/styled-system/css";

type FeatureProps = {
  content: React.ReactNode;
  card: React.ReactNode;
  cardDirection: "right" | "left";
};

export const Topic = ({ content, card, cardDirection }: FeatureProps) => {
  const containerStyle = css({
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

  const contentStyle = css({
    order: cardDirection === "right" ? "1" : "2",
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

  const cardStyle = css({
    order: cardDirection === "right" ? "2" : "1",
    "@media (max-width: 768px)": {
      order: "2",
    },
  });

  return (
    <div className={containerStyle}>
      <div className={contentStyle}>{content}</div>
      <div className={cardStyle}>{card}</div>
    </div>
  );
};
