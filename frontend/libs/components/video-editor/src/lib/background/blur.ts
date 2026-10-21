import { t as uiText } from "@storyteller/common";
export const BACKGROUND_BLUR_INTENSITY_PRESETS: Array<{
  label: string;
  value: number;
}> = [
  { get label() { return uiText("video-editor.blur.light"); }, value: 100 },
  { get label() { return uiText("video-editor.medium"); }, value: 200 },
  { get label() { return uiText("video-editor.heavy"); }, value: 500 },
] as const;

export const DEFAULT_BACKGROUND_BLUR_INTENSITY = 10;
