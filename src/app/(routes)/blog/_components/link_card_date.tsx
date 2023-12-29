"use client";

function get_diff_date(date: Date) {
  const diffMS = Date.now() - date.getTime();
  const progress = new Date(diffMS);
  const progressYear = progress.getUTCFullYear() - 1970;
  const progressMonth = progress.getUTCMonth();
  const progressDate = progress.getUTCDate() - 1;
  if (progressYear >= 1)
    return progressYear === 1 ? "Last year" : `${progressYear} years ago`;
  if (progressMonth >= 1)
    return progressMonth === 1 ? "Last month" : `${progressMonth} months ago`;
  if (progressDate >= 1)
    return progressDate === 1 ? "Yesterday" : `${progressDate} days ago`;
  return "Today";
}

export const DiffDate = ({ date }: { date: Date }) => {
  const diff_date = get_diff_date(date);
  return <>{diff_date}</>;
};
