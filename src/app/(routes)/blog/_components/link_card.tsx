import Link from "next/link";
import Image from "next/image";
import { css } from "@/styled-system/css";
import { Frontmatter } from "@/features/frontmatter";
import { DiffDate } from "./link_card_date";

export type LinkCardProps = {
  slug: string;
  meta: Frontmatter;
};

function get_diff_date(date: Date) {
  const diffMS = Date.now() - date.getTime();
  const progress = new Date(diffMS);
  const progressYear = progress.getUTCFullYear() - 1970;
  const progressMonth = progress.getUTCMonth();
  const progressDate = progress.getUTCDate() - 1;
  if (progressYear) {
    return progressYear === 1 ? "Last year" : `${progressYear} years ago`;
  } else if (progressMonth) {
    return progressMonth === 1 ? "Last month" : `${progressMonth} months ago`;
  } else if (progressDate) {
    return progressDate === 1 ? "Yesterday" : `${progressDate} days ago`;
  } else {
    return "Today";
  }
}

export const LinkCard = ({ slug, meta }: LinkCardProps) => {
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

  return (
    <div key={slug} className={card_style}>
      <Link href={`/blog/${slug}`} key={slug}>
        <Image
          src={`posts/${slug}/${meta.image}`}
          alt={meta.title}
          width={512}
          height={288}
          decoding="async"
          loading="lazy"
          className={image_style}
        />
      </Link>
      <div className={text_container_style}>
        <div className={date_style}>
          <DiffDate date={meta.date} />
        </div>
        <Link href={`/blog/${slug}`} key={slug}>
          <h2 className={title_style}>{meta.title}</h2>
        </Link>
        <div className={description_style}>{meta.description}</div>
      </div>
    </div>
  );
};
