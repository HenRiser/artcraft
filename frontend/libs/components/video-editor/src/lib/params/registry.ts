import { t as uiText } from "@storyteller/common";
import type {
  ParamDefinition,
  ParamValue,
  ParamValues,
} from "./index";
import { MIN_TRANSFORM_SCALE } from "../animation/transform";
import type { BlendMode } from "../rendering";
import type {
  ElementType,
  TimelineElement,
} from "../timeline/types";
import { DEFAULTS } from "../timeline/defaults";
import { VOLUME_DB_MAX, VOLUME_DB_MIN } from "../timeline/audio-constants";
import {
  CORNER_RADIUS_MAX,
  CORNER_RADIUS_MIN,
} from "../text/background";

// Per-element-type parameter registry. Each ElementType maps to an
// ordered list of ParamDefinitions; the properties panel iterates these
// to render the editor controls. ParamDefinition.read/write are
// optional overrides for cases where the param doesn't live in
// `element.params` (e.g. element.type, mediaId, etc.) — most params use
// the default `element.params[key]` accessor.
//
// The registry is keyed by ElementType, so adding a new element type
// requires registering its params here at module-init time.

export type ElementParamDefinition<TKey extends string = string> =
  ParamDefinition<TKey> & {
    read?: ({ element }: { element: TimelineElement }) => ParamValue | null;
    write?: ({
      element,
      value,
    }: {
      element: TimelineElement;
      value: ParamValue;
    }) => TimelineElement;
  };

export function buildDefaultParamValues(
  params: readonly ParamDefinition[],
): ParamValues {
  const values: ParamValues = {};
  for (const param of params) {
    values[param.key] = param.default;
  }
  return values;
}

export class DefinitionRegistry<TKey extends string, TDefinition> {
  private definitions = new Map<TKey, TDefinition>();
  private entityName: string;

  constructor(entityName: string) {
    this.entityName = entityName;
  }

  register({
    key,
    definition,
  }: {
    key: TKey;
    definition: TDefinition;
  }): void {
    this.definitions.set(key, definition);
  }

  has(key: TKey): boolean {
    return this.definitions.has(key);
  }

  get(key: TKey): TDefinition {
    const def = this.definitions.get(key);
    if (!def) {
      throw new Error(`Unknown ${this.entityName}: ${key}`);
    }
    return def;
  }

  getAll(): TDefinition[] {
    return Array.from(this.definitions.values());
  }
}

const BLEND_MODE_OPTIONS: Array<{ value: BlendMode; label: string }> = [
  { value: "normal", get label() { return uiText("common.normal"); } },
  { value: "darken", get label() { return uiText("video-editor.darken"); } },
  { value: "multiply", get label() { return uiText("video-editor.multiply"); } },
  { value: "color-burn", get label() { return uiText("video-editor.color.burn"); } },
  { value: "lighten", get label() { return uiText("video-editor.lighten"); } },
  { value: "screen", get label() { return uiText("video-editor.screen"); } },
  { value: "plus-lighter", get label() { return uiText("video-editor.plus.lighter"); } },
  { value: "color-dodge", get label() { return uiText("video-editor.color.dodge"); } },
  { value: "overlay", get label() { return uiText("video-editor.overlay"); } },
  { value: "soft-light", get label() { return uiText("video-editor.soft.light"); } },
  { value: "hard-light", get label() { return uiText("video-editor.hard.light"); } },
  { value: "difference", get label() { return uiText("video-editor.difference"); } },
  { value: "exclusion", get label() { return uiText("video-editor.exclusion"); } },
  { value: "hue", get label() { return uiText("video-editor.hue"); } },
  { value: "saturation", get label() { return uiText("video-editor.saturation"); } },
  { value: "color", get label() { return uiText("common.color"); } },
  { value: "luminosity", get label() { return uiText("video-editor.luminosity"); } },
];

const visualElementParams: ElementParamDefinition[] = [
  {
    key: "transform.positionX",
    get label() { return uiText("video-editor.position.x"); },
    type: "number",
    default: DEFAULTS.element.transform.position.x,
    min: -100_000,
    step: 1,
  },
  {
    key: "transform.positionY",
    get label() { return uiText("video-editor.position.y"); },
    type: "number",
    default: DEFAULTS.element.transform.position.y,
    min: -100_000,
    step: 1,
  },
  {
    key: "transform.scaleX",
    get label() { return uiText("video-editor.scale.x"); },
    type: "number",
    default: DEFAULTS.element.transform.scaleX,
    min: MIN_TRANSFORM_SCALE,
    step: 0.01,
  },
  {
    key: "transform.scaleY",
    get label() { return uiText("video-editor.scale.y"); },
    type: "number",
    default: DEFAULTS.element.transform.scaleY,
    min: MIN_TRANSFORM_SCALE,
    step: 0.01,
  },
  {
    key: "transform.rotate",
    get label() { return uiText("common.rotate"); },
    type: "number",
    default: DEFAULTS.element.transform.rotate,
    min: -360,
    max: 360,
    step: 1,
  },
  {
    key: "opacity",
    get label() { return uiText("video-editor.opacity"); },
    type: "number",
    default: DEFAULTS.element.opacity,
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    key: "blendMode",
    get label() { return uiText("video-editor.blend.mode"); },
    type: "select",
    default: DEFAULTS.element.blendMode,
    keyframable: false,
    options: BLEND_MODE_OPTIONS,
  },
];

const audioElementParams: ElementParamDefinition[] = [
  {
    key: "volume",
    get label() { return uiText("common.volume"); },
    type: "number",
    default: DEFAULTS.element.volume,
    min: VOLUME_DB_MIN,
    max: VOLUME_DB_MAX,
    step: 0.01,
  },
  {
    key: "muted",
    get label() { return uiText("video-editor.muted"); },
    type: "boolean",
    default: false,
    keyframable: false,
  },
];

const textElementParams: ElementParamDefinition[] = [
  {
    key: "content",
    get label() { return uiText("common.content"); },
    type: "text",
    default: "Default text",
    keyframable: false,
  },
  {
    key: "fontFamily",
    get label() { return uiText("video-editor.font.family"); },
    type: "font",
    default: "Arial",
    keyframable: false,
  },
  {
    key: "fontSize",
    get label() { return uiText("video-editor.font.size"); },
    type: "number",
    default: 15,
    min: 1,
    step: 1,
  },
  {
    key: "color",
    get label() { return uiText("common.color"); },
    type: "color",
    default: "#ffffff",
  },
  {
    key: "textAlign",
    get label() { return uiText("video-editor.text.align"); },
    type: "select",
    default: "center",
    keyframable: false,
    options: [
      { value: "left", get label() { return uiText("video-editor.left"); } },
      { value: "center", get label() { return uiText("common.center"); } },
      { value: "right", get label() { return uiText("video-editor.right"); } },
    ],
  },
  {
    key: "fontWeight",
    get label() { return uiText("video-editor.font.weight"); },
    type: "select",
    default: "normal",
    keyframable: false,
    options: [
      { value: "normal", get label() { return uiText("common.normal"); } },
      { value: "bold", get label() { return uiText("video-editor.bold"); } },
    ],
  },
  {
    key: "fontStyle",
    get label() { return uiText("video-editor.font.style"); },
    type: "select",
    default: "normal",
    keyframable: false,
    options: [
      { value: "normal", get label() { return uiText("common.normal"); } },
      { value: "italic", get label() { return uiText("video-editor.italic"); } },
    ],
  },
  {
    key: "textDecoration",
    get label() { return uiText("video-editor.text.decoration"); },
    type: "select",
    default: "none",
    keyframable: false,
    options: [
      { value: "none", get label() { return uiText("video-editor.none"); } },
      { value: "underline", get label() { return uiText("video-editor.underline"); } },
      { value: "line-through", get label() { return uiText("video-editor.line.through"); } },
    ],
  },
  {
    key: "letterSpacing",
    get label() { return uiText("video-editor.letter.spacing.2"); },
    type: "number",
    default: DEFAULTS.text.letterSpacing,
    min: -100,
    step: 0.1,
  },
  {
    key: "lineHeight",
    get label() { return uiText("video-editor.line.height.2"); },
    type: "number",
    default: DEFAULTS.text.lineHeight,
    min: 0.1,
    step: 0.1,
  },
  {
    key: "background.enabled",
    get label() { return uiText("video-editor.background.enabled"); },
    type: "boolean",
    default: DEFAULTS.text.background.enabled,
    keyframable: false,
  },
  {
    key: "background.color",
    get label() { return uiText("video-editor.background.color"); },
    type: "color",
    default: DEFAULTS.text.background.color,
    dependencies: [{ param: "background.enabled", equals: true }],
  },
  {
    key: "background.cornerRadius",
    get label() { return uiText("video-editor.background.radius"); },
    type: "number",
    default: DEFAULTS.text.background.cornerRadius,
    min: CORNER_RADIUS_MIN,
    max: CORNER_RADIUS_MAX,
    step: 1,
    dependencies: [{ param: "background.enabled", equals: true }],
  },
  {
    key: "background.paddingX",
    get label() { return uiText("video-editor.background.padding.x"); },
    type: "number",
    default: DEFAULTS.text.background.paddingX,
    min: 0,
    step: 1,
    dependencies: [{ param: "background.enabled", equals: true }],
  },
  {
    key: "background.paddingY",
    get label() { return uiText("video-editor.background.padding.y"); },
    type: "number",
    default: DEFAULTS.text.background.paddingY,
    min: 0,
    step: 1,
    dependencies: [{ param: "background.enabled", equals: true }],
  },
  {
    key: "background.offsetX",
    get label() { return uiText("video-editor.background.offset.x"); },
    type: "number",
    default: DEFAULTS.text.background.offsetX,
    min: -100_000,
    step: 1,
    dependencies: [{ param: "background.enabled", equals: true }],
  },
  {
    key: "background.offsetY",
    get label() { return uiText("video-editor.background.offset.y"); },
    type: "number",
    default: DEFAULTS.text.background.offsetY,
    min: -100_000,
    step: 1,
    dependencies: [{ param: "background.enabled", equals: true }],
  },
];

export const elementParamRegistry = new DefinitionRegistry<
  ElementType,
  readonly ElementParamDefinition[]
>("element params");

elementParamRegistry.register({
  key: "video",
  definition: [...visualElementParams, ...audioElementParams],
});
elementParamRegistry.register({ key: "image", definition: visualElementParams });
elementParamRegistry.register({
  key: "text",
  definition: [...textElementParams, ...visualElementParams],
});
elementParamRegistry.register({
  key: "sticker",
  definition: visualElementParams,
});
elementParamRegistry.register({
  key: "graphic",
  definition: visualElementParams,
});
elementParamRegistry.register({ key: "audio", definition: audioElementParams });
elementParamRegistry.register({ key: "effect", definition: [] });

export function getElementParams({
  element,
}: {
  element: TimelineElement;
}): readonly ElementParamDefinition[] {
  return elementParamRegistry.has(element.type)
    ? elementParamRegistry.get(element.type)
    : [];
}

export function getBuiltInElementParams({
  type,
}: {
  type: ElementType;
}): readonly ElementParamDefinition[] {
  return elementParamRegistry.has(type) ? elementParamRegistry.get(type) : [];
}

export function getElementParam({
  element,
  key,
}: {
  element: TimelineElement;
  key: string;
}): ElementParamDefinition | null {
  return (
    getElementParams({ element }).find((param) => param.key === key) ?? null
  );
}

export function readElementParamValue({
  element,
  param,
}: {
  element: TimelineElement;
  param: ElementParamDefinition;
}): ParamValue | null {
  if (param.read) {
    return param.read({ element });
  }
  if ("params" in element) {
    return element.params[param.key] ?? param.default;
  }
  return null;
}

export function writeElementParamValue({
  element,
  param,
  value,
}: {
  element: TimelineElement;
  param: ElementParamDefinition;
  value: ParamValue;
}): TimelineElement {
  if (param.write) {
    return param.write({ element, value });
  }
  if ("params" in element) {
    return {
      ...element,
      params: {
        ...element.params,
        [param.key]: value,
      },
    };
  }
  return element;
}

export function buildElementParamValues({
  element,
}: {
  element: TimelineElement;
}): ParamValues {
  const values: ParamValues = {};
  for (const param of getElementParams({ element })) {
    const value = readElementParamValue({ element, param });
    if (value !== null) {
      values[param.key] = value;
    }
  }
  return values;
}
