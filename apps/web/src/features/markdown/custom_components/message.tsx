import { css } from "@/styled-system/css";
import { IconInfo } from "@/components/icons";

export type MessageProps = {
  children: React.ReactNode;
};

export const Message = ({ children }: MessageProps) => {
  const container_style = css({
    display: "flex",
    mt: 6,
    padding: 4,
    gap: 4,
    borderRadius: "lg",
    backgroundColor: ["blue.100"],
    color: "gray.600",
  });

  return (
    <aside className={container_style}>
      <span>
        <IconInfo className={css({ fontSize: "2xl" })} />
      </span>
      <div>{children}</div>
    </aside>
  );
};
