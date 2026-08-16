"use client";

function get_diff_date(date: Date) {
  const diffMS = Date.now() - date.getTime();
  const progress = new Date(diffMS);
  const progressYear = progress.getUTCFullYear() - 1970;
  const progressMonth = progress.getUTCMonth();
  const progressDate = progress.getUTCDate() - 1;
  if (progressYear) {
    return progressYear === 1 ? "Last year" : `${String(progressYear)} years ago`;
  }
  if (progressMonth) {
    return progressMonth === 1 ? "Last month" : `${String(progressMonth)} months ago`;
  }
  if (progressDate) {
    return progressDate === 1 ? "Yesterday" : `${String(progressDate)} days ago`;
  }
  return "Today";
}

export const LinkCardDateDiff = (props: { date: Date }) => <>{get_diff_date(props.date)}</>;
