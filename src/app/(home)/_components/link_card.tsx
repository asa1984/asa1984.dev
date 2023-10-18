import Link from "next/link";
import { css } from "@/styled-system/css";

export type CardProps = {
  title: React.ReactNode;
  href: string;
  description?: React.ReactNode;
};

export default ({ title, href, description }: CardProps) => {
  const container_style = css({
    display: "block",
    padding: 8,
    aspectRatio: "2/1",
    backgroundColor: "white",
    border: "3px solid",
    borderRadius: "xl",
    transitionDuration: "0.2s",
    transitionTimingFunction: "ease-out",
    boxShadow: {
      base: "4px 4px 0 0 var(--colors-black)",
      _hover: "8px 8px 0 0 var(--colors-black)",
    },
    "@media (max-width: 768px)": {
      padding: 4,
      aspectRatio: "auto",
    },
  });

  const title_style = css({
    fontSize: "4xl",
    fontWeight: "bold",
  });

  const description_style = css({
    marginTop: 3,
    fontSize: "lg",
    fontWeight: "semibold",
    color: "gray.600",
  });

  return (
    <Link href={href} className={container_style}>
      <p className={title_style}>{title}</p>
      <p className={description_style}>{description}</p>
    </Link>
  );
};
