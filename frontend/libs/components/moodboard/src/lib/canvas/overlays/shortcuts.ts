import { t as uiText } from "@storyteller/common";
// Single source of truth for moodboard keyboard shortcuts. Consumed by
// `ShortcutCheatsheet.tsx` (rendering) and indirectly by
// `useKeyboardShortcuts.ts` (wiring). The `keys` array is the label shown
// to the user; the actual matching logic lives in the hook because some
// shortcuts are modifier-sensitive and platform-specific.

export interface ShortcutRow {
  label: string;
  keys: string[];
  section: "Tools" | "Selection" | "Editing" | "Viewport" | "History";
}

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform);

export const MOD = isMac ? "⌘" : "Ctrl";

// Renders a key combo as a compact tooltip label. Mac uses adjacent symbols
// (⌘⇧Z); other platforms use "+" separators (Ctrl+Shift+Z). Pass keys in
// order, e.g. [MOD, "Shift", "Z"].
export const fmtShortcut = (keys: string[]): string =>
  isMac
    ? keys.map((k) => (k === "Shift" ? "⇧" : k)).join("")
    : keys.join("+");

export const SHORTCUTS: ShortcutRow[] = [
  // Tools
  { section: "Tools", get label() { return uiText("moodboard.select.tool"); }, keys: ["V"] },
  { section: "Tools", get label() { return uiText("moodboard.lasso.tool"); }, keys: ["L"] },
  { section: "Tools", get label() { return uiText("moodboard.text.tool"); }, keys: ["T"] },

  // Selection
  { section: "Selection", get label() { return uiText("moodboard.select.all"); }, keys: [MOD, "A"] },
  { section: "Selection", get label() { return uiText("common.clear.selection"); }, keys: ["Esc"] },
  { section: "Selection", get label() { return uiText("moodboard.add.remove.from.selection"); }, keys: ["Shift", "Click"] },

  // Editing
  { section: "Editing", get label() { return uiText("moodboard.delete.selection"); }, keys: ["Delete"] },
  { section: "Editing", get label() { return uiText("moodboard.group.selection"); }, keys: [MOD, "G"] },
  { section: "Editing", get label() { return uiText("moodboard.ungroup.selection"); }, keys: [MOD, "Shift", "G"] },
  { section: "Editing", get label() { return uiText("moodboard.paste.image"); }, keys: [MOD, "V"] },

  // Viewport
  { section: "Viewport", get label() { return uiText("moodboard.pan"); }, keys: ["Middle-click", "drag"] },
  { section: "Viewport", get label() { return uiText("moodboard.pan.alt"); }, keys: ["Space", "drag"] },
  { section: "Viewport", get label() { return uiText("common.zoom"); }, keys: ["Scroll"] },
  { section: "Viewport", get label() { return uiText("moodboard.reset.zoom"); }, keys: [MOD, "0"] },
  { section: "Viewport", get label() { return uiText("moodboard.zoom.to.fit"); }, keys: ["Shift", "1"] },

  // History
  { section: "History", get label() { return uiText("common.undo"); }, keys: [MOD, "Z"] },
  { section: "History", get label() { return uiText("common.redo"); }, keys: [MOD, "Shift", "Z"] },
];
