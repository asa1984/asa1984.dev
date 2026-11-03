import { defineEnv, url } from "void/env";

export default defineEnv({
  /**
   * The URL the site is deployed to, such as https://asa1984.dev. Pages are prerendered at build
   * time, so absolute URLs (og:image, RSS) are built from this instead of the request.
   */
  VITE_SITE_URL: url(),
});
