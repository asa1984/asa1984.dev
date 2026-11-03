import { useState } from "react";

import { IconArrowDown, IconArrowLeft } from "#/components/icons.tsx";
import { css } from "#/styled-system/css";

const homeItem = { path: "", name: "Home" };

const items = [
  homeItem,
  { path: "profile", name: "Profile" },
  { path: "blog", name: "Blog" },
  { path: "context", name: "Context" },
];

const containerStyle = css({
  display: "flex",
  alignItems: "center",
});

const currentStyle = css({ fontSize: "lg", fontWeight: "bold" });

const dropdownStyle = css({
  position: "relative",
  transitionDuration: "0.2s",
  transitionTimingFunction: "ease-out",
});

const toggleStyle = css({
  ml: 1,
  pt: 1,
  display: "grid",
  placeItems: "center",
  fontSize: "2xl",
  cursor: "pointer",
});

const menuStyle = css({
  position: "absolute",
  zIndex: 999,
  p: 2,
  width: "130px",
  backgroundColor: "white",
  top: "30px",
  right: 0,
  borderRadius: "lg",
  borderStyle: "solid",
  borderWidth: "2px",
});

const itemStyle = css({
  pl: 2,
  py: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: "lg",
  fontWeight: "semibold",
  _hover: {
    background: "black",
    color: "white",
    borderRadius: "lg",
  },
});

const currentMarkStyle = css({ fontSize: "2xl" });

/**
 * The header's menu of the top-level pages. Hydrated as an island, so its props must be
 * serializable.
 */
const NavMenu = ({
  segment,
}: {
  /** The first path segment of the current page. */
  segment: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const current = items.find((item) => item.path === segment) ?? homeItem;

  /** Closes the menu on a press anywhere outside the dropdown. */
  const closeOnOutsidePress = (dropdown: HTMLDivElement) => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!(event.target instanceof Node && dropdown.contains(event.target))) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  };

  return (
    <div className={containerStyle}>
      <a href={`/${segment}`} className={currentStyle}>
        {current.name.toLowerCase()}
      </a>
      <div className={dropdownStyle} ref={closeOnOutsidePress}>
        <button
          aria-label="Open menu"
          type="button"
          className={toggleStyle}
          onClick={() => {
            setIsOpen((previous) => !previous);
          }}
        >
          <IconArrowDown />
        </button>
        {isOpen && (
          <div className={menuStyle}>
            {items.map((item) => (
              <a key={item.path} href={`/${item.path}`} className={itemStyle}>
                <span>{item.name}</span>
                {item.path === segment && <IconArrowLeft className={currentMarkStyle} />}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NavMenu;
