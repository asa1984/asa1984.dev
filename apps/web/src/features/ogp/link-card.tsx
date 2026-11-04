import { css } from "#/styled-system/css";

import type { Ogp } from "./fetch-ogp.ts";

const containerStyle = css({
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

const textContainerStyle = css({
  p: 4,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  overflow: "hidden",
  whiteSpace: "nowrap",
});

const titleStyle = css({
  mt: 1,
  fontWeight: "semibold",
  fontSize: "lg",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

const descriptionStyle = css({
  fontSize: "sm",
  color: "gray.500",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

const hostnameStyle = css({
  display: "flex",
  alignItems: "center",
  color: "gray.600",
  fontWeight: "semibold",
  fontSize: "sm",
});

const faviconStyle = css({ w: 4, h: 4, mr: 2 });

const imageStyle = css({
  maxWidth: "50%",
  height: "auto",
  borderLeft: "1px solid var(--colors-gray-300)",
  flexShrink: 0,
  objectFit: "cover",
});

/** A card linking to an external page, built from its Open Graph metadata (fetchOgp). */
export const OgpLinkCard = ({ url, title, description, image }: Ogp) => {
  const { hostname } = new URL(url);

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={containerStyle}>
      <div className={textContainerStyle}>
        <div className={titleStyle}>{title ?? hostname}</div>
        <div>
          <div className={descriptionStyle}>{description}</div>
          <div className={hostnameStyle}>
            <span>
              <img
                src={`https://www.google.com/s2/favicons?size=14&domain_url=${hostname}`}
                alt="favicon"
                decoding="async"
                loading="lazy"
                className={faviconStyle}
              />
            </span>
            <span>{hostname}</span>
          </div>
        </div>
      </div>
      {image !== undefined && image !== "" && (
        <img
          src={image}
          // Kept as the site has always shown it when the image fails to load.
          // oxlint-disable-next-line jsx-a11y/img-redundant-alt
          alt={`og:image of ${hostname}`}
          decoding="async"
          loading="lazy"
          className={imageStyle}
        />
      )}
    </a>
  );
};
