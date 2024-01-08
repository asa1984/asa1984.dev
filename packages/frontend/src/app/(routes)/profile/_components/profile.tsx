import { ReactNode } from "react";
import { css } from "@/styled-system/css";
import NextImage from "next/image";

const Info = ({ tag, info }: { tag: string; info: ReactNode }) => {
  const tag_style = css({
    fontSize: "md",
    fontWeight: "semibold",
    color: "gray.500",
  });

  const info_style = css({
    fontSize: "lg",
    whiteSpace: "pre-wrap",
  });

  return (
    <div className={css({ marginTop: 2 })}>
      <p className={tag_style}>{tag}</p>
      <p className={info_style}>{info}</p>
    </div>
  );
};

function get_age() {
  const now = new Date();
  const birth = new Date("2004-10-29");
  const age = now.getFullYear() - birth.getFullYear();
  if (now.getMonth() < birth.getMonth()) {
    return age - 1;
  }
  if (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate()) {
    return age - 1;
  }
  return age;
}

const ProfileCard = () => {
  const profile_container_style = css({
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

  const name_style = css({
    fontSize: "4xl",
    fontWeight: "extrabold",
  });

  const image_container_style = css({
    paddingTop: 4,
    paddingX: 8,
    "@media (max-width: 768px)": {
      marginTop: 8,
      padding: 0,
    },
  });

  return (
    <div className={profile_container_style}>
      <div>
        <h1 className={name_style}>Asahi Sato</h1>
        <Info tag="Age" info={`${get_age()} | 2004-present`} />
        <Info tag="Location" info="Miyagi, Japan" />
        <Info
          tag="Org"
          info={"National Institue of Technology, Sendai College\n" + "Robotics course, 4th grade"}
        />
      </div>
      <div className={image_container_style}>
        <NextImage
          src="/images/asa1984_sleeping.webp"
          alt="asa1984 sleeps in the share space of Sendai Kosen"
          width={330}
          height={250}
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
};

export default ProfileCard;
