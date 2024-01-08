import { css } from "@/styled-system/css";
// import { ToolChipContainer } from "@/components/toolchip";

export type IconCardProps = {
  icon: React.ReactNode;
  href: string;
  toolchip?: React.ReactNode;
};

export default ({ icon, href, toolchip }: IconCardProps) => {
  const container_style = css({
    display: "grid",
    placeItems: "center",
    backgroundColor: "white",
    border: "3px solid",
    borderRadius: "xl",
    transitionDuration: "0.2s",
    transitionTimingFunction: "ease-out",
    boxShadow: {
      base: "4px 4px 0 0 black",
      _hover: "8px 8px 0 0 var(--colors-black)",
    },
    "@media (max-width: 768px)": {
      aspectRatio: "2 / 1",
    },
  });

  const icon_style = css({
    fontSize: "4xl",
    fontWeight: "bold",
  });

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={container_style}>
      <div className={icon_style}>{icon}</div>
    </a>
  );
};
