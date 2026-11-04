import { css } from "#/styled-system/css";

const cardStyle = css({
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

const imageStyle = css({
  width: "100%",
  aspectRatio: "16 / 9",
  objectFit: "cover",
});

const textContainerStyle = css({
  px: 4,
  pt: 2,
  pb: 4,
  borderTop: "2px solid",
  overflow: "hidden",
});
const dateStyle = css({
  color: "gray.500",
  fontSize: "sm",
});
const titleStyle = css({
  mt: 1,
  fontSize: "xl",
  fontWeight: "bold",
});
const descriptionStyle = css({
  mt: 2,
  color: "gray.500",
  fontStyle: "italic",
});

/** A card linking to a blog post. */
export const LinkCard = ({
  slug,
  title,
  description,
  image,
  date,
}: {
  slug: string;
  title: string;
  description: string;
  image: string;
  /** The RelativeDate island of the post's date. */
  date: React.ReactNode;
}) => (
  <div className={cardStyle}>
    <a href={`/blog/${slug}`}>
      <img
        src={image}
        alt={title}
        width={512}
        height={288}
        decoding="async"
        loading="lazy"
        className={imageStyle}
      />
      <div className={textContainerStyle}>
        <div className={dateStyle}>{date}</div>
        <h2 className={titleStyle}>{title}</h2>
        <div className={descriptionStyle}>{description}</div>
      </div>
    </a>
  </div>
);
