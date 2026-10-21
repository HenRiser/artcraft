import { t as uiText, useLocale as useUiLocale } from "@storyteller/common";
"use client";

import {
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "../../components/ui/context-menu";
import { usePreviewViewport } from "./preview-viewport";
import { useEditor } from "../../editor/use-editor";
import type { PreviewOverlayControl } from "../overlays";
import { useEditorAdapters } from "../../EditorProvider";

export function PreviewContextMenu({
  onToggleFullscreen,
  container,
  overlayControls,
  onOverlayVisibilityChange,
}: {
  onToggleFullscreen: () => void;
  container: HTMLElement | null;
  overlayControls: PreviewOverlayControl[];
  onOverlayVisibilityChange: (params: {
    overlayId: string;
    isVisible: boolean;
  }) => void;
}) {
  useUiLocale();
  const editor = useEditor();
  const viewport = usePreviewViewport();
  const { toast } = useEditorAdapters();

  const handleCopySnapshot = async () => {
    const result = await editor.renderer.copySnapshot();

    if (!result.success) {
      toast.error(uiText("video-editor.failed.to.copy.snapshot"), {
        description: result.error ?? uiText("desktop.please.try.again"),
      });
      return;
    }
  };

  const handleSaveSnapshot = async () => {
    const result = await editor.renderer.saveSnapshot();

    if (!result.success) {
      toast.error(uiText("video-editor.failed.to.save.snapshot"), {
        description: result.error ?? uiText("desktop.please.try.again"),
      });
      return;
    }
  };

  return (
    <ContextMenuContent className="w-56" container={container}>
      <ContextMenuItem onClick={viewport.fitToScreen} inset>{uiText("video-editor.fit.to.screen")}{" "}</ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem onClick={onToggleFullscreen} inset>{uiText("video-editor.full.screen")}{" "}</ContextMenuItem>
      <ContextMenuItem onClick={handleSaveSnapshot} inset>{uiText("video-editor.save.snapshot")}{" "}</ContextMenuItem>
      <ContextMenuItem onClick={handleCopySnapshot} inset>{uiText("video-editor.copy.snapshot")}{" "}</ContextMenuItem>
      {overlayControls.length > 0 ? <ContextMenuSeparator /> : null}
      {overlayControls.map((overlayControl) => (
        <ContextMenuCheckboxItem
          key={overlayControl.id}
          checked={overlayControl.isVisible}
          onCheckedChange={(checked) =>
            onOverlayVisibilityChange({
              overlayId: overlayControl.id,
              isVisible: !!checked,
            })
          }
        >
          {overlayControl.label}
        </ContextMenuCheckboxItem>
      ))}
    </ContextMenuContent>
  );
}
