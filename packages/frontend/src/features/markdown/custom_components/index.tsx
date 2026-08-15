import type { Components } from "hast-util-to-jsx-runtime";
import Image from "next/image";
import Link from "next/link";
import LinkCard from "@/features/ogp";
import { css } from "@/styled-system/css";
import { Message } from "./message";

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

// hast-util-to-jsx-runtime resolves any hast tag name against this record at
// runtime, but its Components type only covers intrinsic elements — the
// custom <message>/<linkcard> elements produced by our remark plugins ride
// along as extra keys.
type CustomComponents = Partial<Components> & {
  message: (props: { children?: React.ReactNode }) => React.ReactNode;
  linkcard: (props: { href?: string }) => React.ReactNode;
};

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
  img: (props) => {
    if (!props.src) {
      return null;
    }
    if (props.src.startsWith("./")) {
      const filename = props.src.replace("./", "");
      const image_url = `/content-assets/${type}/${slug}/${filename}`;
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
  linkcard: ({ href }) =>
    href ? (
      <div
        className={css({
          mt: 8,
        })}
      >
        <LinkCard href={href} />
      </div>
    ) : null,
});
