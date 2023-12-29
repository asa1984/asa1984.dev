export const CURRENT_TIMESTAMP = () => new Date().toISOString();

export type Type = {
  mimeType: string;
  suffix: string;
};

const signatures: Record<string, Type> = {
  R: { mimeType: "image/gif", suffix: "gif" },
  i: { mimeType: "image/png", suffix: "png" },
  "/": { mimeType: "image/jpg", suffix: "jpg" },
  U: { mimeType: "image/webp", suffix: "webp" },
};

export const detectType = (b64: string): Type | undefined => {
  for (const s in signatures) {
    if (b64.indexOf(s) === 0) {
      return signatures[s];
    }
  }
};
