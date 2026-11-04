import type { Components } from "hast-util-to-jsx-runtime";

import type { Ogp } from "#/features/ogp.ts";
import { OgpLinkCard } from "#/features/ogp.ts";
import { css } from "#/styled-system/css";

import { Message } from "./message.tsx";

const anchorStyle = css({
  color: "blue.500",
  backgroundImage: "linear-gradient(90deg, #0086e0, #0086e0)",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "left bottom",
  backgroundSize: "0% 1px",
  transitionDuration: "0.4s",
  _hover: {
    backgroundSize: "100% 1px",
  },
});

const imageStyle = css({
  marginX: "auto",
  display: "block",
  maxWidth: "100%",
  borderRadius: "xl",
  overflow: "hidden",
});

const linkCardStyle = css({ mt: 8 });

/**
 * hast-util-to-jsx-runtime resolves any hast tag name against this record, but its Components
 * type only covers intrinsic elements, so the custom elements from the remark plugins ride along
 * as extra keys.
 */
type ArticleComponents = Partial<Components> & {
  message: (props: { children?: React.ReactNode }) => React.ReactNode;
  linkcard: (props: { href?: string }) => React.ReactNode;
};

/** The components that render an article's hast, with link cards built from `ogps`. */
export const createComponents = (ogps: Record<string, Ogp>): ArticleComponents => ({
  a: ({ href, children, ...props }) => {
    if (href === undefined || href === "") {
      return (
        <a className={anchorStyle} {...props}>
          {children}
        </a>
      );
    }
    if (href.startsWith("/") || href.startsWith("#")) {
      return (
        <a href={href} className={anchorStyle}>
          {children}
        </a>
      );
    }
    return (
      <a target="_blank" rel="noopener noreferrer" className={anchorStyle} href={href} {...props}>
        {children}
      </a>
    );
  },

  img: ({ src, alt }) => {
    if (src === undefined || src === "") {
      return null;
    }
    // The article's own images get a fixed box so the layout does not shift while they load.
    const size = src.startsWith("/content-assets/") ? { width: 500, height: 500 } : {};
    return (
      <img
        src={src}
        alt={alt ?? "alt"}
        {...size}
        loading="lazy"
        decoding="async"
        className={imageStyle}
      />
    );
  },

  message: ({ children }) => <Message>{children}</Message>,

  linkcard: ({ href }) =>
    href === undefined ? null : (
      <div className={linkCardStyle}>
        <OgpLinkCard
          {...(ogps[href] ?? {
            url: href,
            title: undefined,
            description: undefined,
            image: undefined,
          })}
        />
      </div>
    ),
});
