import crypto from "node:crypto";

export const sha256 = (data: string): string => {
  const hash = crypto.createHash("sha256");
  hash.update(data);
  return hash.digest("hex");
};
