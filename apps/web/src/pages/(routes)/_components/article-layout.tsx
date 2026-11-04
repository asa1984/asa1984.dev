import { IconPen } from "#/components/icons.tsx";
import { formatDateString, toSiteDate } from "#/libs/date.ts";
import type { SitePath } from "#/libs/site-path.ts";
import { css } from "#/styled-system/css";

const articleStyle = css({
  mx: "auto",
  maxW: "75ch",
});

const headerStyle = css({
  my: 12,
  pb: 8,
  borderBottom: "1px solid var(--colors-gray-300)",
  "@media (max-width: 768px)": {
    my: 8,
  },
});

const coverStyle = css({
  mx: "auto",
  width: "lg",
  aspectRatio: "16 / 9",
  objectFit: "cover",
  borderRadius: "xl",
  borderStyle: "solid",
  borderWidth: "2px",
  borderColor: "black",
});

const titleStyle = css({
  mt: 12,
  mx: "auto",
  maxW: "max",
  fontSize: "4xl",
  fontWeight: "extrabold",
});

const descriptionStyle = css({ mt: 4, textAlign: "center" });

const dateStyle = css({
  mt: 4,
  display: "flex",
  color: "gray.500",
  fontWeight: "semibold",
  justifyContent: "center",
  alignItems: "center",
});

const penStyle = css({
  display: "inline-block",
  mr: 1,
  fontSize: "lg",
});

/** A post's header (cover, title, description, date) followed by its article. */
export const ArticleLayout = ({
  title,
  description,
  image,
  date,
  children,
}: {
  title: string;
  description?: string;
  image?: SitePath;
  date: Temporal.Instant;
  /** The article itself. */
  children: React.ReactNode;
}) => {
  const published = toSiteDate(date);
  return (
    <article className={articleStyle}>
      <header className={headerStyle}>
        {image !== undefined && (
          <img
            src={image}
            alt={title}
            width={512}
            height={288}
            fetchPriority="high"
            decoding="async"
            className={coverStyle}
          />
        )}
        <h1 className={titleStyle}>{title}</h1>
        {description !== undefined && <p className={descriptionStyle}>{description}</p>}
        <time dateTime={published.toString()} className={dateStyle}>
          <IconPen className={penStyle} />
          {formatDateString(published)}
        </time>
      </header>
      <main>{children}</main>
    </article>
  );
};
