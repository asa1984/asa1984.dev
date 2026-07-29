import { createHash } from "node:crypto";
import type { Components } from "hast-util-to-jsx-runtime";
import Image from "next/image";
import Link from "next/link";
import LinkCard from "@/features/ogp";
import type { OgpLinkCardProps } from "@/features/ogp/OgpLinkCard";
import { env } from "@/libs/env";
import { css } from "@/styled-system/css";
import { Message, type MessageProps } from "./message";

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

// `Components` only knows about intrinsic elements, but the remark plugins emit
// `message` / `linkcard` elements too.
type CustomComponents = Partial<Components> & Record<string, unknown>;

export const create_custom_components = ({
  type,
  slug,
}: {
  type: string;
  slug: string;
}): CustomComponents => ({
  // Links
  a: (props: React.ComponentPropsWithoutRef<"a">) => {
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
      <a
        target="_blank"
        rel="noopener noreferrer"
        className={anchor_style}
        {...props}
      >
        {children}
      </a>
    );
  },

  // Images
  img: (props: React.ComponentPropsWithoutRef<"img">) => {
    const src = typeof props.src === "string" ? props.src : undefined;
    if (!src) {
      return null;
    }
    if (src.startsWith("./")) {
      const filename = src.replace("./", "");
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
        src={src}
        alt={props.alt ?? "alt"}
        loading="lazy"
        decoding="async"
        className={image_style}
      />
    );
  },

  // Special components
  message: (props: MessageProps) => <Message {...props} />,
  linkcard: (props: OgpLinkCardProps) => (
    <div
      className={css({
        mt: 8,
      })}
    >
      <LinkCard {...props} />
    </div>
  ),
});
