import { css } from "@/styled-system/css";
import { Suspense } from "react";
import { fetch_ogp } from "./fetch_ogp";

export type OgpLinkCardPresenterProps = {
  href: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
};

const container_style = css({
  width: "full",
  height: "120px",
  display: "flex",
  justifyContent: "space-between",
  border: "1px solid var(--colors-gray-300)",
  borderRadius: "lg",
  transitionDuration: "0.2s",
  transitionTimingFunction: "ease-in-out",
  overflow: "hidden",
  _hover: {
    backgroundColor: "gray.200",
  },
});

const text_container_style = css({
  p: 4,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  overflow: "hidden",
  whiteSpace: "nowrap",
});
const title_style = css({
  mt: 1,
  fontWeight: "semibold",
  fontSize: "lg",
  overflow: "hidden",
  textOverflow: "ellipsis",
});
const description_style = css({
  fontSize: "sm",
  color: "gray.500",
  overflow: "hidden",
  textOverflow: "ellipsis",
});
const hostname_style = css({
  display: "flex",
  alignItems: "center",
  color: "gray.600",
  fontWeight: "semibold",
  fontSize: "sm",
});
const favicon_style = css({ w: 4, h: 4, mr: 2 });

export const OgpLinkCardPresenter = ({
  href,
  title,
  description,
  image,
}: OgpLinkCardPresenterProps) => {
  const url = new URL(href);
  const hostname = url.hostname;

  const image_style = css({
    maxWidth: "50%",
    height: "auto",
    borderLeft: "1px solid var(--colors-gray-300)",
    flexShrink: 0,
    objectFit: "cover",
  });

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={container_style}>
      <div className={text_container_style}>
        <div className={title_style}>{title ?? hostname}</div>
        <div>
          <div className={description_style}>{description}</div>
          <div className={hostname_style}>
            <span>
              <img
                src={`https://www.google.com/s2/favicons?size=14&domain_url=${hostname}`}
                alt="favicon"
                decoding="async"
                loading="lazy"
                className={favicon_style}
              />
            </span>
            <span>{hostname}</span>
          </div>
        </div>
      </div>
      {image && (
        <img
          src={image}
          alt={`og:image of ${hostname}`}
          decoding="async"
          loading="lazy"
          className={image_style}
        />
      )}
    </a>
  );
};

export type OgpLinkCardProps = {
  href: string;
};

export const OgpLinkCard = async ({ href }: OgpLinkCardProps) => {
  const ogp = await fetch_ogp(href);
  return <OgpLinkCardPresenter {...ogp} />;
};

export const OgpLinkCardWrapper = ({ href }: OgpLinkCardProps) => {
  return (
    <Suspense fallback={<p>Loading</p>}>
      <OgpLinkCard href={href} />
    </Suspense>
  );
};
