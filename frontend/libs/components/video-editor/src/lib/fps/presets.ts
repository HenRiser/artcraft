import { t as uiText } from "@storyteller/common";
export const FPS_PRESETS = [
  { value: "24", get label() { return uiText("video-editor.24.fps"); } },
  { value: "25", get label() { return uiText("video-editor.25.fps"); } },
  { value: "30", get label() { return uiText("video-editor.30.fps"); } },
  { value: "60", get label() { return uiText("video-editor.60.fps"); } },
  { value: "120", get label() { return uiText("video-editor.120.fps"); } },
] as const;
