"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

import { useEffect, useRef, useState } from "react";

import { css } from "@/styled-system/css";
import { IconArrowDown, IconArrowLeft } from "@/components/icons";

const useOnClickOutside = (
  ref: React.RefObject<HTMLDivElement>,
  handler: (event: MouseEvent | TouchEvent) => void,
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

export const NavMenu = () => {
  const segment = useSelectedLayoutSegment();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setOpen(false));

  const items = [
    { path: "", name: "Home" },
    { path: "profile", name: "Profile" },
    { path: "blog", name: "Blog" },
    { path: "context", name: "Context" },
  ];

  const on_click = () => setOpen((open) => !open);

  const current = items.find((item) => item.path === segment) ?? items[0];

  return (
    <div
      className={css({
        display: "flex",
        alignItems: "center",
      })}
    >
      <Link
        href={`/${segment}`}
        className={css({ fontSize: "lg", fontWeight: "bold" })}
      >
        {current.name.toLowerCase()}
      </Link>
      <div
        className={css({
          position: "relative",
          transitionDuration: "0.2s",
          transitionTimingFunction: "ease-out",
        })}
        ref={ref}
      >
        <button
          className={css({
            ml: 1,
            pt: 1,
            display: "grid",
            placeItems: "center",
            fontSize: "2xl",
            cursor: "pointer",
          })}
          onClick={on_click}
        >
          <IconArrowDown />
        </button>
        {open && (
          <div
            className={css({
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
            })}
          >
            {items.map((item) => (
              <Link
                key={item.path}
                href={`/${item.path}`}
                className={css({
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
                })}
              >
                <span>{item.name}</span>
                {item.path === segment && (
                  <IconArrowLeft className={css({ fontSize: "2xl" })} />
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
