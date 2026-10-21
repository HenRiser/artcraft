import { useSyncExternalStore } from "react";
import { en } from "./en";
import { zhCN } from "./zh-CN";

const listeners = new Set<() => void>();
const englishKeys = new Map<string, MessageKey>(
  Object.entries(en)
    .sort(([a], [b]) => Number(a.startsWith("common.")) - Number(b.startsWith("common.")))
    .map(([key, value]) => [value, key as MessageKey]),
);

export type UiLanguage = "zh-CN" | "en";
export type MessageKey = keyof typeof en;
type ParametersOf<S extends string> = S extends `${string}{${infer P}}${infer Rest}`
  ? P | ParametersOf<Rest> : never;
type MessageParameters<K extends MessageKey> = Record<ParametersOf<(typeof en)[K]>, string | number | undefined>;

let locale: UiLanguage = "zh-CN";

export function getLocale(): UiLanguage {
  return locale;
}

export function setLocale(value: UiLanguage): void {
  if (value !== "zh-CN" && value !== "en") return;
  if (typeof document !== "undefined") document.documentElement.lang = value;
  if (locale === value) return;
  locale = value;
  listeners.forEach((listener) => listener());
}

export function useLocale(): UiLanguage {
  return useSyncExternalStore(subscribe, getLocale, () => "zh-CN");
}

export function useTranslation() {
  const language = useLocale();
  return { t, locale: language };
}

export function t<K extends MessageKey>(
  key: K,
  ...args: ParametersOf<(typeof en)[K]> extends never
    ? [params?: Record<string, string | number | undefined>]
    : [params: MessageParameters<K>]
): string {
  return renderMessage(key, args[0]);
}

/** Resolve presentation metadata without changing identifiers or stored data. */
export function localize(text: string | undefined): string {
  if (text === undefined) return "";
  const key = englishKeys.get(text);
  return key === undefined ? text : renderMessage(key);
}

export function localizeError(text: string): string {
  const translated = localize(text);
  if (locale === "en" || translated !== text || /[\u3400-\u9fff]/.test(text)) return translated;
  return t("errors.unknown", { details: text });
}

export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : locale, options).format(value);
}

export function formatDate(value: Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : locale, options).format(value);
}

function renderMessage(key: MessageKey, params?: Record<string, string | number | undefined>): string {
  const text = (locale === "zh-CN" ? zhCN[key] : en[key]) ?? en[key];
  if (text === undefined) {
    if (import.meta.env.DEV) console.warn(`Missing UI translation: ${key}`);
    return key;
  }
  if (params === undefined) return text;
  return text.replace(/\{(\w+)\}/g, (_match, name: string) => String(params[name] ?? ""));
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
