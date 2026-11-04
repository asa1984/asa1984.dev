import { defineHead } from "void";

export const prerender = true;

export const head = defineHead(() => ({
  title: "Not Found",
  meta: [
    { name: "robots", content: "noindex" },
    { name: "description", content: "Not Found" },
  ],
}));
