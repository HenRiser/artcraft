import { t as uiText } from "@storyteller/common";
import type { ParamDefinition } from "../../params";

// Shared "stroke alignment" param used by every built-in graphic.
// Stroke alignment determines whether the stroke draws inside, on the
// path, or outside it. Lives here (rather than per-definition) so
// every shape has identical option ordering + labels in the panel.

export type GraphicStrokeAlign = "inside" | "center" | "outside";

export const STROKE_ALIGN_PARAM: ParamDefinition<"strokeAlign"> = {
  key: "strokeAlign",
  get label() { return uiText("video-editor.stroke.align"); },
  type: "select",
  default: "center",
  group: "stroke",
  options: [
    { value: "inside", get label() { return uiText("common.inside"); } },
    { value: "center", get label() { return uiText("common.center"); } },
    { value: "outside", get label() { return uiText("common.outside"); } },
  ],
};
