import { css } from "#/styled-system/css";

const cardStyle = css({
  display: "grid",
  gridTemplateRows: "2fr 1fr",
  overflow: "hidden",
  border: "2px solid",
  borderRadius: "lg",
  aspectRatio: "4 / 3",
  transitionDuration: "0.1s",
  transitionTimingFunction: "ease-in-out",
  _hover: {
    transform: "scale(1.01)",
  },
  "@media (max-width: 768px)": {
    gridTemplateRows: "1fr",
    gridTemplateColumns: "auto 1fr",
    aspectRatio: "auto",
  },
});

/** A card linking to a Context post, showing its emoji and month/day. */
export const LinkCard = ({
  slug,
  title,
  emoji,
  date,
}: {
  slug: string;
  title: string;
  emoji: string;
  /** ISO 8601 date of the post. */
  date: string;
}) => {
  const published = new Date(date);
  const month = published.getMonth() + 1;
  const day = published.getDate();
  return (
    // The rule cannot see that the title rendered inside is the link's text.
    // oxlint-disable-next-line jsx-a11y/control-has-associated-label
    <a href={`/context/${slug}`} className={cardStyle}>
      <div
        className={css({
          display: "grid",
          placeItems: "center",
          "@media (max-width: 768px)": {
            padding: 4,
          },
        })}
      >
        <span
          className={css({
            fontSize: "6xl",
            userSelect: "none",
            "@media (max-width: 768px)": {
              fontSize: "3xl",
            },
          })}
        >
          <span className={css({ fontFamily: "emoji" })}>{emoji}</span>
        </span>
      </div>
      <div
        className={css({
          padding: 2,
          backgroundColor: "#fff",
          display: "grid",
          alignItems: "center",
          textAlign: "center",
          borderTop: "2px solid",
          "@media (max-width: 768px)": {
            textAlign: "left",
            borderTop: "none",
            borderLeft: "2px solid",
          },
        })}
      >
        <div
          className={css({
            overflow: "hidden",
          })}
        >
          <h3
            className={css({
              fontSize: "xl",
              width: "auto",
              overflow: "hidden",
              fontWeight: "semibold",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            })}
          >
            {title}
          </h3>
          <time dateTime={date} className={css({ color: "gray.500" })}>
            {month}/{day}
          </time>
        </div>
      </div>
    </a>
  );
};
