import { useNow } from "#/libs/use-now.ts";

const birthday = new Date("2004-10-29");

const ageAt = (now: Date): number => {
  const age = now.getFullYear() - birthday.getFullYear();
  const isBeforeBirthday =
    now.getMonth() < birthday.getMonth() ||
    (now.getMonth() === birthday.getMonth() && now.getDate() < birthday.getDate());
  return isBeforeBirthday ? age - 1 : age;
};

/** asa1984's current age. Hydrated as an island so it follows the reader's clock. */
const Age = ({
  renderedAt,
}: {
  /** When the page was prerendered, in milliseconds since the epoch. */
  renderedAt: number;
}) => `${String(ageAt(new Date(useNow(renderedAt))))} | 2004-present`;

export default Age;
