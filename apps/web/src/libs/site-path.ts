import { z } from "zod";

/** A site-relative URL path, such as `/content-assets/blog/first/first.webp`. */
export const sitePathSchema = z.string().startsWith("/").brand<"SitePath">();
export type SitePath = z.infer<typeof sitePathSchema>;
