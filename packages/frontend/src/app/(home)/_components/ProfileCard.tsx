import { css } from "@/styled-system/css";
import Image from "next/image";

const container_style = css({
  marginTop: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
});

const image_style = css({
  backgroundColor: "white",
  overflow: "hidden",
  borderRadius: "xl",
  border: "3px solid",
  borderColor: "black",
});

const h1_style = css({
  fontSize: "5xl",
  fontWeight: "extrabold",
});

const text_sub_style = css({
  fontWeight: "semibold",
  color: "gray.600",
});

export default () => {
  return (
    <div className={container_style}>
      <Image
        src="/images/asa1984.webp"
        width={128}
        height={128}
        priority
        alt="asa1984's icon"
        decoding="async"
        className={image_style}
      />
      <div>
        <h1 className={h1_style}>asa1984</h1>
        <p className={text_sub_style}>he/him | 2004-present</p>
      </div>
    </div>
  );
};
