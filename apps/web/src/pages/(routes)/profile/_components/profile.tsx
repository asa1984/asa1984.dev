import type { ReactNode } from "react";

import { css } from "#/styled-system/css";

const tagStyle = css({
  fontSize: "md",
  fontWeight: "semibold",
  color: "gray.500",
});

const infoStyle = css({
  fontSize: "lg",
  whiteSpace: "pre-wrap",
});

const Info = ({ tag, info }: { tag: string; info: ReactNode }) => (
  <div className={css({ marginTop: 2 })}>
    <p className={tagStyle}>{tag}</p>
    <p className={infoStyle}>{info}</p>
  </div>
);

const profileContainerStyle = css({
  padding: "8",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  alignItems: "center",
  justifyItems: "center",
  "@media (max-width: 768px)": {
    gridTemplateColumns: "1fr",
    gridTemplateRows: "1fr 1fr",
  },
  backgroundColor: "black",
  color: "white",
  borderRadius: "xl",
});

const nameStyle = css({
  fontSize: "4xl",
  fontWeight: "extrabold",
});

const imageContainerStyle = css({
  paddingTop: 4,
  paddingX: 8,
  "@media (max-width: 768px)": {
    marginTop: 8,
    padding: 0,
  },
});

/** The black card at the top of the profile page. */
export const ProfileCard = ({
  age,
}: {
  /** The Age island. */
  age: ReactNode;
}) => (
  <div className={profileContainerStyle}>
    <div>
      <h1 className={nameStyle}>Asahi Sato</h1>
      <Info tag="Age" info={age} />
      <Info tag="Location" info="Tokyo, Japan" />
      <Info tag="Org" info="HERP, Inc." />
    </div>
    <div className={imageContainerStyle}>
      <img
        src="/images/asa1984_sleeping.webp"
        alt="asa1984 sleeps in the share space of Sendai Kosen"
        width={330}
        height={250}
        fetchPriority="high"
        className={css({ width: "auto", borderRadius: "xl" })}
      />
      <div
        className={css({
          marginTop: 1,
          textAlign: "center",
          fontSize: "sm",
          fontWeight: "semibold",
          color: "gray.500",
        })}
      >
        me
      </div>
    </div>
  </div>
);
