import { IconInfo } from "#/components/icons.tsx";
import { css } from "#/styled-system/css";

const containerStyle = css({
  display: "flex",
  mt: 6,
  padding: 4,
  gap: 4,
  borderRadius: "lg",
  backgroundColor: "blue.100",
  color: "gray.600",
});

const iconStyle = css({ fontSize: "2xl" });

/** A Zenn `:::message` block. */
export const Message = ({ children }: { children?: React.ReactNode }) => (
  <aside className={containerStyle}>
    <span>
      <IconInfo className={iconStyle} />
    </span>
    <div>{children}</div>
  </aside>
);
