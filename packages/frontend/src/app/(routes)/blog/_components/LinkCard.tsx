import type { Frontmatter } from "@/features/blog";
import { css } from "@/styled-system/css";
import Image from "next/image";
import Link from "next/link";
import { LinkCardDateDiff } from "./LinkCardDateDiff";

const card_style = css({
  display: "grid",
  gridTemplateRows: "auto 1fr auto",
  borderRadius: "xl",
  overflow: "hidden",
  backgroundColor: "#fff",
  border: "2px solid",
  transitionDuration: "0.1s",
  transitionTimingFunction: "ease-in-out",
  _hover: {
    transform: "scale(1.01)",
  },
});

const image_style = css({
  width: "100%",
  aspectRatio: "16 / 9",
  objectFit: "cover",
});

const text_container_style = css({
  px: 4,
  pt: 2,
  pb: 4,
  borderTop: "2px solid",
  overflow: "hidden",
});
const date_style = css({
  color: "gray.500",
  fontSize: "sm",
});
const title_style = css({
  mt: 1,
  fontSize: "xl",
  fontWeight: "bold",
});
const description_style = css({
  mt: 2,
  color: "gray.500",
  fontStyle: "italic",
});

export type LinkCardProps = {
  slug: string;
  meta: Frontmatter;
};

export const LinkCard = ({ slug, meta }: LinkCardProps) => {
  return (
    <div key={slug} className={card_style}>
      <Link href={`/blog/${slug}`} key={slug}>
        <Image
          src={meta.image}
          alt={meta.title}
          width={512}
          height={288}
          decoding="async"
          loading="lazy"
          className={image_style}
        />
        <div className={text_container_style}>
          <div className={date_style}>
            <LinkCardDateDiff date={meta.date} />
          </div>
          <h2 className={title_style}>{meta.title}</h2>
          <div className={description_style}>{meta.description}</div>
        </div>
      </Link>
    </div>
  );
};
