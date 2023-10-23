import Link from "next/link";
import { Noto_Emoji } from "next/font/google";
import { css } from "@/styled-system/css";

import { Frontmatter } from "@/features/miniblog";

const emoji = Noto_Emoji({
  subsets: ["emoji"],
});

export type LinkCardProps = {
  slug: string;
  meta: Frontmatter;
};

export const LinkCard = ({ slug, meta }: LinkCardProps) => {
  const { date } = meta;

  const card_style = css({
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

  const month = date.getMonth() + 1;
  const day = date.getDate();
  return (
    <Link href={`/context/${slug}`} key={slug} className={card_style}>
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
          <span className={emoji.className}>{meta.emoji}</span>
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
            {meta.title}
          </h3>
          <time
            dateTime={date.toISOString()}
            className={css({ color: "gray.500" })}
          >
            {month}/{day}
          </time>
        </div>
      </div>
    </Link>
  );
};
