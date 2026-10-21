import { t as uiText } from "@storyteller/common";
import { signal } from "@preact/signals-core";

export const loadingBarIsShowing = signal(false);
export const loadingBarData = signal<{
  label: string;
  message: string;
  progress: number;
}>({
  get label() { return uiText("app.loading.editor.engine"); },
  progress: 5,
  message: "",
});
