import Link from "next/link";
import Image from "next/image";
import { css } from "@/styled-system/css";
import { Frontmatter } from "@/features/blog";

function get_diff_date(date: Date) {
  const diffMS = Date.now() - date.getTime();
  const progress = new Date(diffMS);
  const progressYear = progress.getUTCFullYear() - 1970;
  const progressMonth = progress.getUTCMonth();
  const progressDate = progress.getUTCDate() - 1;
  if (progressYear) return progressYear === 1 ? "Last year" : `${progressYear} years ago`;
  if (progressMonth) return progressMonth === 1 ? "Last month" : `${progressMonth} months ago`;
  if (progressDate) return progressDate === 1 ? "Yesterday" : `${progressDate} days ago`;
  return "Today";
}

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
          <div className={date_style}>{get_diff_date(meta.date)}</div>
          <h2 className={title_style}>{meta.title}</h2>
          <div className={description_style}>{meta.description}</div>
        </div>
      </Link>
    </div>
  );
};
