import { t as uiText } from "@storyteller/common";
import type { ShortcutKey } from "./keybinding";
import type { TActionWithOptionalArgs } from "./types";

export type TActionCategory =
  | "playback"
  | "navigation"
  | "editing"
  | "selection"
  | "history"
  | "timeline"
  | "controls"
  | "assets";

export interface TActionBaseDefinition {
  description: string;
  category: TActionCategory;
  args?: Record<string, unknown>;
}

export interface TActionDefinition extends TActionBaseDefinition {
  defaultShortcuts?: readonly ShortcutKey[];
}

export const ACTIONS = {
  "toggle-play": {
    get description() { return uiText("video-editor.play.pause"); },
    category: "playback",
  },
  "stop-playback": {
    get description() { return uiText("video-editor.stop.playback"); },
    category: "playback",
  },
  "seek-forward": {
    get description() { return uiText("video-editor.seek.forward.1.second"); },
    category: "playback",
    args: { seconds: "number" },
  },
  "seek-backward": {
    get description() { return uiText("video-editor.seek.backward.1.second"); },
    category: "playback",
    args: { seconds: "number" },
  },
  "frame-step-forward": {
    get description() { return uiText("video-editor.frame.step.forward"); },
    category: "navigation",
  },
  "frame-step-backward": {
    get description() { return uiText("video-editor.frame.step.backward"); },
    category: "navigation",
  },
  "jump-forward": {
    get description() { return uiText("video-editor.jump.forward.5.seconds"); },
    category: "navigation",
    args: { seconds: "number" },
  },
  "jump-backward": {
    get description() { return uiText("video-editor.jump.backward.5.seconds"); },
    category: "navigation",
    args: { seconds: "number" },
  },
  "goto-start": {
    get description() { return uiText("video-editor.go.to.timeline.start"); },
    category: "navigation",
  },
  "goto-end": {
    get description() { return uiText("video-editor.go.to.timeline.end"); },
    category: "navigation",
  },
  split: {
    get description() { return uiText("video-editor.split.elements.at.playhead"); },
    category: "editing",
  },
  "split-left": {
    get description() { return uiText("video-editor.split.and.remove.left"); },
    category: "editing",
  },
  "split-right": {
    get description() { return uiText("video-editor.split.and.remove.right"); },
    category: "editing",
  },
  "delete-selected": {
    get description() { return uiText("video-editor.delete.current.selection"); },
    category: "editing",
  },
  "copy-selected": {
    get description() { return uiText("video-editor.copy.selected.elements"); },
    category: "editing",
  },
  "paste-copied": {
    get description() { return uiText("video-editor.paste.elements.at.playhead"); },
    category: "editing",
  },
  "toggle-snapping": {
    get description() { return uiText("video-editor.toggle.snapping"); },
    category: "editing",
  },
  "toggle-ripple-editing": {
    get description() { return uiText("video-editor.toggle.ripple.editing"); },
    category: "editing",
  },
  "toggle-source-audio": {
    get description() { return uiText("video-editor.extract.or.recover.source.audio"); },
    category: "editing",
  },
  "select-all": {
    get description() { return uiText("video-editor.select.all.elements"); },
    category: "selection",
  },
  "cancel-interaction": {
    get description() { return uiText("video-editor.cancel.current.interaction"); },
    category: "controls",
  },
  "deselect-all": {
    get description() { return uiText("video-editor.deselect.all.elements"); },
    category: "selection",
  },
  "duplicate-selected": {
    get description() { return uiText("video-editor.duplicate.selected.element"); },
    category: "selection",
  },
  "toggle-elements-muted-selected": {
    get description() { return uiText("video-editor.mute.unmute.selected.elements"); },
    category: "selection",
  },
  "toggle-elements-visibility-selected": {
    get description() { return uiText("video-editor.show.hide.selected.elements"); },
    category: "selection",
  },
  "toggle-bookmark": {
    get description() { return uiText("video-editor.toggle.bookmark.at.playhead"); },
    category: "timeline",
  },
  undo: {
    get description() { return uiText("common.undo"); },
    category: "history",
  },
  redo: {
    get description() { return uiText("common.redo"); },
    category: "history",
  },
  "remove-media-asset": {
    get description() { return uiText("video-editor.remove.media.asset"); },
    category: "assets",
    args: { projectId: "string", assetId: "string" },
  },
  "remove-media-assets": {
    get description() { return uiText("video-editor.remove.media.assets"); },
    category: "assets",
    args: { projectId: "string", assetIds: "string[]" },
  },
} as const satisfies Record<string, TActionBaseDefinition>;

export type TAction = keyof typeof ACTIONS;

const ACTION_DEFAULT_SHORTCUTS = [
  ["toggle-play", ["space", "k"]],
  ["seek-forward", ["l"]],
  ["seek-backward", ["j"]],
  ["frame-step-forward", ["right"]],
  ["frame-step-backward", ["left"]],
  ["jump-forward", ["shift+right"]],
  ["jump-backward", ["shift+left"]],
  ["goto-start", ["home", "enter"]],
  ["goto-end", ["end"]],
  ["split", ["s"]],
  ["split-left", ["q"]],
  ["split-right", ["w"]],
  ["delete-selected", ["backspace", "delete"]],
  ["copy-selected", ["ctrl+c"]],
  ["paste-copied", ["ctrl+v"]],
  ["toggle-snapping", ["n"]],
  ["select-all", ["ctrl+a"]],
  ["cancel-interaction", ["escape"]],
  ["duplicate-selected", ["ctrl+d"]],
  ["undo", ["ctrl+z"]],
  ["redo", ["ctrl+shift+z", "ctrl+y"]],
] as const satisfies ReadonlyArray<
  readonly [TActionWithOptionalArgs, readonly ShortcutKey[]]
>;

const ACTION_DEFAULT_SHORTCUTS_BY_ACTION = new Map<
  TAction,
  readonly ShortcutKey[]
>(ACTION_DEFAULT_SHORTCUTS);

export function getActionDefinition({
  action,
}: {
  action: TAction;
}): TActionDefinition {
  return {
    ...ACTIONS[action],
    defaultShortcuts: ACTION_DEFAULT_SHORTCUTS_BY_ACTION.get(action),
  };
}

export function getDefaultShortcuts(): Map<
  ShortcutKey,
  TActionWithOptionalArgs
> {
  const shortcuts = new Map<ShortcutKey, TActionWithOptionalArgs>();

  for (const [action, defaultShortcuts] of ACTION_DEFAULT_SHORTCUTS) {
    for (const shortcut of defaultShortcuts) {
      shortcuts.set(shortcut, action);
    }
  }

  return shortcuts;
}
