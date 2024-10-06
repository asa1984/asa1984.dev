import { createHash } from "node:crypto";
import LinkCard from "@/features/ogp";
import { env } from "@/libs/env";
import { css } from "@/styled-system/css";
import type { MDXRemoteProps } from "next-mdx-remote";
import Image from "next/image";
import Link from "next/link";
import { Message } from "./message";

const sha256 = (text: string) => {
  const hash = createHash("sha256");
  hash.update(text);
  return hash.digest("hex");
};

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

const image_style = css({
  marginX: "auto",
  display: "block",
  maxWidth: "100%",
  borderRadius: "xl",
  overflow: "hidden",
});

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
    if (!props.src) {
      return null;
    }
    if (props.src.startsWith("./")) {
      const filename = props.src.replace("./", "");
      const key = sha256(`${type}/${slug}/${filename}`);
      const image_url = `${env.BACKEND_URL}/image/delivery/${key}`;
      return (
        <Image
          src={image_url}
          alt={props.alt ?? "alt"}
          width={500}
          height={500}
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
