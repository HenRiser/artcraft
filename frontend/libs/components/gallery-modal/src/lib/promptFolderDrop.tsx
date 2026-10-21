import { t as uiText } from "@storyteller/common";
import {
  showActionReminder,
  isActionReminderOpen,
} from "@storyteller/ui-action-reminder-modal";

export interface FolderDropPromptOptions {
  count: number;
  targetFolderName?: string;
  onMove: () => void | Promise<void>;
  onAdd: () => void | Promise<void>;
}

/**
 * Ask whether to move items into a folder or add a copy. Used when the items
 * come from another folder (folder → folder). "Move here" removes them from the
 * source; "Add a copy" keeps them in both; the X / backdrop cancels.
 */
export function promptFolderDrop({
  count,
  targetFolderName,
  onMove,
  onAdd,
}: FolderDropPromptOptions): void {
  const plural = count === 1 ? "" : "s";
  const dest = targetFolderName ? ` to "${targetFolderName}"` : "";
  showActionReminder({
    reminderType: "default",
    get title() { return uiText("gallery-modal.move.or.copy.value.item.value", { value0: count, value1: plural }); },
    message: (
      <p className="text-sm text-white/70">{uiText("common.move")}{dest}{" "}{uiText("gallery-modal.removes")}{" "}{count === 1 ? uiText("common.it") : uiText("common.them")}{" "}{uiText("gallery-modal.from.the.current.folder.add.a.copy.keeps")}{" "}{count === 1 ? uiText("common.it") : uiText("common.them")}{" "}{uiText("gallery-modal.in.both")}{" "}</p>
    ),
    primaryActionText: uiText("desktop.move.here"),
    onPrimaryAction: async () => {
      try {
        await onMove();
      } finally {
        isActionReminderOpen.value = false;
      }
    },
    secondaryActionText: uiText("desktop.add.a.copy"),
    onSecondaryAction: async () => {
      try {
        await onAdd();
      } finally {
        isActionReminderOpen.value = false;
      }
    },
  });
}
