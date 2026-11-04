import { useNow } from "#/libs/use-now.ts";

const formatElapsed = ({ date, now }: { date: Date; now: number }): string => {
  const elapsed = new Date(now - date.getTime());
  const years = elapsed.getUTCFullYear() - 1970;
  const months = elapsed.getUTCMonth();
  const days = elapsed.getUTCDate() - 1;
  if (years > 0) {
    return years === 1 ? "Last year" : `${String(years)} years ago`;
  }
  if (months > 0) {
    return months === 1 ? "Last month" : `${String(months)} months ago`;
  }
  if (days > 0) {
    return days === 1 ? "Yesterday" : `${String(days)} days ago`;
  }
  return "Today";
};

/**
 * How long ago a post was published, such as "3 days ago". Hydrated as an island so the text
 * follows the reader's clock rather than the build's.
 */
const RelativeDate = ({
  date,
  renderedAt,
}: {
  /** ISO 8601 date of the post. */
  date: string;
  /** When the page was prerendered, in milliseconds since the epoch. */
  renderedAt: number;
}) => formatElapsed({ date: new Date(date), now: useNow(renderedAt) });

export default RelativeDate;
