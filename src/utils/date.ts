import { formatDistanceToNowStrict, format } from "date-fns";

function toValidDate(value: string | Date | null | undefined) {
  if (!value) {
    return null;
  }

  const parsedDate = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

export function formatDate(value: string | Date | null | undefined, pattern = "dd MMM yyyy") {
  const date = toValidDate(value);
  if (!date) {
    return "--";
  }
  return format(date, pattern);
}

export function formatDateTime(value: string | Date | null | undefined) {
  const date = toValidDate(value);
  if (!date) {
    return "--";
  }
  return format(date, "dd MMM yyyy, hh:mm a");
}

export function relativeTime(value: string | Date | null | undefined) {
  const date = toValidDate(value);
  if (!date) {
    return "--";
  }
  return formatDistanceToNowStrict(date, { addSuffix: true });
}
