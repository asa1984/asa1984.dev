import { type MDXRemoteProps } from "next-mdx-remote";

import Link from "next/link";
import { css } from "@/styled-system/css";

import LinkCard from "@/features/ogp";
import { Message } from "./message";
import { env } from "@/libs/env";
import { createHash } from "crypto";

type CustomComponents = MDXRemoteProps["components"];

export const create_custom_components = ({
  type,
  slug,
}: {
  type: string;
  slug: string;
}): CustomComponents => ({
  // Links
  a: (props) => {
    const { href, children } = props;
    const anchor_style = css({
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

    if (!href) {
      return (
        <a className={anchor_style} {...props}>
          {children}
        </a>
      );
    }

    // Internal link
    if (href.startsWith("/") || href.startsWith("#")) {
      return (
        <Link href={href} className={anchor_style}>
          {children}
        </Link>
      );
    }

    // External link
    return (
      <a target="_blank" rel="noopener noreferrer" className={anchor_style} {...props}>
        {children}
      </a>
    );
  },

  // Images
  img: (props) => {
    const image_style = css({
      marginX: "auto",
      display: "block",
      maxWidth: "100%",
      borderRadius: "xl",
      overflow: "hidden",
    });
    if (!props.src) {
      return null;
    }
    if (props.src.startsWith("/")) {
      const image_url = (image: string) => {
        const extention = image.split(".").pop();
        const hash = createHash("sha256");
        hash.update(`${type}/${slug}${image}`);
        const hashed = hash.digest("hex");
        return `${env.API_URL}/image/delivery/${hashed}.${extention}`;
      };
      return (
        <img
          src={image_url(props.src)}
          alt={props.alt ?? "alt"}
          loading="lazy"
          decoding="async"
          className={image_style}
        />
      );
    }
    return (
      <img
        src={props.src}
        alt={props.alt ?? "alt"}
        loading="lazy"
        decoding="async"
        className={image_style}
      />
    );
  },

  // Special components
  message: (props) => <Message {...props} />,
  linkcard: (props) => (
    <div
      className={css({
        mt: 8,
      })}
    >
      <LinkCard {...props} />
    </div>
  ),
});
