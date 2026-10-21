import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement, useEffect, useState } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { en } from "./en";
import { zhCN } from "./zh-CN";
import { formatNumber, getLocale, localize, localizeError, setLocale, t, useLocale } from "./index";

beforeEach(() => setLocale("zh-CN"));
afterEach(cleanup);

describe("desktop localization", () => {
  it("covers every key with the same interpolation parameters", () => {
    expect(Object.keys(zhCN).sort()).toEqual(Object.keys(en).sort());
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      const parameters = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
      expect(zhCN[key].length, key).toBeGreaterThan(0);
      expect(parameters(zhCN[key]), key).toEqual(parameters(en[key]));
    }
  });

  it("defaults to Chinese, supports English, and preserves unknown content", () => {
    expect(getLocale()).toBe("zh-CN");
    expect(t("settings.language")).toBe("语言");
    expect(localize("Close")).toBe("关闭");
    expect(localize("User supplied prompt 123")).toBe("User supplied prompt 123");
    expect(localizeError("provider diagnostic 123")).toBe("发生了意外错误。详细信息：provider diagnostic 123");
    expect(t("errors.unknown", { details: "<script>example</script>" })).toContain("<script>example</script>");
    setLocale("en");
    expect(t("settings.language")).toBe("Language");
    expect(localize("Close")).toBe("Close");
    expect(document.documentElement.lang).toBe("en");
    expect(formatNumber(1234.5)).toBe("1,234.5");
  });

  it("updates mounted components without resetting input, selection, or history", () => {
    let mounts = 0;
    function Editor() {
      useLocale();
      const [value, setValue] = useState("original");
      const [history, setHistory] = useState<string[]>([]);
      useEffect(() => { mounts++; }, []);
      return createElement("div", null,
        createElement("label", null, t("settings.language")),
        createElement("textarea", { value, onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => {
          setHistory((previous) => [...previous, value]);
          setValue(event.target.value);
        } }),
        createElement("output", null, history.join(",")));
    }
    render(createElement(Editor));
    const input = screen.getByRole("textbox") as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: "中文输入 Draft 123" } });
    input.focus();
    input.setSelectionRange(2, 6);
    act(() => setLocale("en"));
    expect(screen.getByText("Language")).toBeTruthy();
    expect(screen.getByRole("textbox")).toBe(input);
    expect(input.value).toBe("中文输入 Draft 123");
    expect(input.selectionStart).toBe(2);
    expect(input.selectionEnd).toBe(6);
    expect(screen.getByRole("status").textContent).toBe("original");
    expect(mounts).toBe(1);
  });
});
