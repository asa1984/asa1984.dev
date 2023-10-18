import Image from "next/image";
import { css } from "@/styled-system/css";

export type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  shadow?: boolean;
  meta?: React.ReactNode;
};

export default ({ src, alt, width, height, shadow, meta }: Props) => {
  const image_style = css({
    borderRadius: "xl",
    width: "full",
    border: "3px solid",
    borderColor: "black",
    boxShadow: shadow ? "4px 4px 0 0 black" : undefined,
  });

  return (
    <div>
      <Image
        src={src}
        width={width}
        height={height}
        alt={alt}
        className={image_style}
      />
      {meta && (
        <p
          className={css({
            color: "gray.500",
            fontSize: "sm",
            fontWeight: "semibold",
            textAlign: "center",
          })}
        >
          {meta}
        </p>
      )}
    </div>
  );
};
