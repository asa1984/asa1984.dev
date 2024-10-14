import { IconGitHub, IconScrapbox, IconX, IconZenn } from "@/components/icons";
import { css } from "@/styled-system/css";
import IconCard from "./_components/IconCard";
import LinkCard from "./_components/LinkCard";
import NameOrigin from "./_components/NameOrigin";
import ProfileCard from "./_components/ProfileCard";

const links_container_style = css({
  marginTop: 16,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gridGap: 8,
  "@media (max-width: 768px)": {
    gridTemplateColumns: "1fr",
  },
});

const icons_container_style = css({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gridGap: 4,
});

export default function Page() {
  return (
    <>
      <ProfileCard />
      <NameOrigin />
      <div className={links_container_style}>
        <LinkCard title="Profile" description="Who are you?" href="/profile" />
        <LinkCard title="Blog" description="Technology!" href="/blog" />
        <LinkCard title="Context" description="Feel, Think, Output" href="/context" />
        <div className={icons_container_style}>
          <IconCard icon={<IconX />} toolchip="X" href="https://x.com/asa_high_ost" />
          <IconCard icon={<IconGitHub />} toolchip="GitHub" href="https://github.com/asa1984" />
          <IconCard icon={<IconZenn />} toolchip="Zenn" href="https://zenn.dev/asa1984" />
          <IconCard
            icon={<IconScrapbox />}
            toolchip="Scrapbox"
            href="https://scrapbox.io/asa1984"
          />
        </div>
      </div>
    </>
  );
}
