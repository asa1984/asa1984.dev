import { fetch_ogp } from "./fetch_ogp";
import { LinkCard } from "./linkcard";

export type OgpLinkCardProps = {
  href: string;
};

export default async function OgpLinkCard({ href }: OgpLinkCardProps) {
  const ogp = await fetch_ogp(href);
  return <LinkCard {...ogp} />;
}
