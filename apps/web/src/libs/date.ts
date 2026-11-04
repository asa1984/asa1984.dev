/** The time zone the site's dates are written in and shown in. */
const siteTimeZone = "Asia/Tokyo";

/** The calendar date of an instant in the site's time zone. */
export const toSiteDate = (instant: Temporal.Instant): Temporal.PlainDate =>
  instant.toZonedDateTimeISO(siteTimeZone).toPlainDate();

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Formats a date like `Date#toDateString`, such as `Wed Nov 16 2022`. */
export const formatDateString = (date: Temporal.PlainDate): string =>
  [
    weekdays[date.dayOfWeek - 1],
    months[date.month - 1],
    String(date.day).padStart(2, "0"),
    String(date.year),
  ].join(" ");
