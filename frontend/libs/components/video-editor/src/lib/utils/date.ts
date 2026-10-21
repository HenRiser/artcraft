import { getLocale } from "@storyteller/common";

export function formatDate({ date }: { date: Date }): string {
  return date.toLocaleDateString(getLocale() === "en" ? "en-US" : "zh-CN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
