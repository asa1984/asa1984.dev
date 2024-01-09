import { fetch_ogp } from "./fetch_ogp";
import { LinkCard } from "./linkcard";
import { Suspense } from "react";

export type OgpLinkCardProps = {
  href: string;
};

const OgpLinkCard = async ({ href }: OgpLinkCardProps) => {
  const ogp = await fetch_ogp(href);
  return <LinkCard {...ogp} />;
};

const OgpLinkCardWrapper = ({ href }: OgpLinkCardProps) => {
  return (
    <Suspense fallback={<p>Loading</p>}>
      <OgpLinkCard href={href} />
    </Suspense>
  );
};

export default OgpLinkCardWrapper;
