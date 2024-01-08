import { css, cva } from "@/styled-system/css";

export type ToolChipProps = {
  children: React.ReactNode;
  toolchip: React.ReactNode;
  when?: "hover" | "click";
};

export const ToolChipContainer = ({ children, toolchip, when }: ToolChipProps) => {
  const container_style = css({
    position: "relative",
    cursor: "pointer",
  });

  const toolchip_style = cva({
    base: {
      opacity: 0,
      visibility: "hidden",
      position: "absolute",
      left: "50%",
      transform: "translateX(-50%)",
      bottom: "-35px",
      display: "inline-block",
      padding: "5px",
      whiteSpace: "nowrap",
      fontSize: "sm",
      backgroundColor: "black",
      color: "white",
      borderRadius: "md",
      transitionDuration: "0.2s",
      transitionTimingFunction: "ease-out",
    },
    variants: {
      when: {
        hover: {
          _groupHover: {
            opacity: 1,
            visibility: "visible",
          },
        },
        click: {
          _groupChecked: {
            opacity: 1,
            visibility: "visible",
          },
        },
      },
    },
    defaultVariants: {
      when: "hover",
    },
  });

  return (
    <div className="group">
      <div className={container_style}>
        <span className={toolchip_style({ when })}>{toolchip}</span>
        {children}
      </div>
    </div>
  );
};
