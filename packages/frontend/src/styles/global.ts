import { defineGlobalStyles } from "@pandacss/dev";

export const global_css = defineGlobalStyles({
  "html, body": {
    color: "black",
    backgroundColor: "white",
    fontFamily: "sans",
    lineHeight: "1.5",
  },
  html: {
    overflowY: "scroll",
    "::-webkit-scrollbar": {
      width: "10px",
    },
    "::-webkit-scrollbar-thumb": {
      background: "gray.400",
    },
  },
});
