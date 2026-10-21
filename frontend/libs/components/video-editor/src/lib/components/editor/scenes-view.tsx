import { t as uiText, useLocale as useUiLocale } from "@storyteller/common";
"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { Check, ListCheck, Trash2 } from "lucide-react";
import { cn } from "../../utils/ui";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "../ui/dialog";
import { canDeleteScene, getMainScene } from "../../timeline/scenes";
import { useEditorAdapters } from "../../EditorProvider";
import { useEditor } from "../../editor/use-editor";

export function ScenesView({ children }: { children: React.ReactNode }) {
  useUiLocale();
  const editor = useEditor();
  const scenes = editor.scenes.getScenes();
  const currentScene = editor.scenes.getActiveScene();
  const { toast } = useEditorAdapters();
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedScenes, setSelectedScenes] = useState<Set<string>>(new Set());

  const handleSceneSwitch = async (sceneId: string) => {
    if (isSelectMode) {
      toggleSceneSelection({ sceneId });
      return;
    }

    try {
      await editor.scenes.switchToScene({ sceneId });
    } catch (error) {
      console.error("Failed to switch scene:", error);
    }
  };

  const toggleSceneSelection = ({ sceneId }: { sceneId: string }) => {
    setSelectedScenes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sceneId)) {
        newSet.delete(sceneId);
      } else {
        newSet.add(sceneId);
      }
      return newSet;
    });
  };

  const handleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedScenes(new Set());
  };

  const handleDeleteSelected = async () => {
    for (const sceneId of selectedScenes) {
      const scene = scenes.find((scene) => scene.id === sceneId);
      if (!scene) {
        continue;
      }

      const { canDelete, reason } = canDeleteScene({ scene });
      if (!canDelete) {
        toast.error(reason || uiText("desktop.failed.to.delete.scene"));
        continue;
      }

      try {
        await editor.scenes.deleteScene({ sceneId });
      } catch (error) {
        console.error("Failed to delete scene:", error);
      }
    }
    setSelectedScenes(new Set());
    setIsSelectMode(false);
  };

  const isMainSceneSelected = (() => {
    const mainScene = getMainScene({ scenes });
    return Boolean(mainScene?.id && selectedScenes.has(mainScene.id));
  })();

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {isSelectMode ? uiText("video-editor.select.scenes.value", { value0: selectedScenes.size }) : uiText("video-editor.scenes")}
          </SheetTitle>
          <SheetDescription>
            {isSelectMode
              ? uiText("video-editor.select.scenes.to.delete")
              : uiText("video-editor.switch.between.scenes.in.your.project")}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-2">
            <Button
              className="rounded-md"
              variant={isSelectMode ? "default" : "outline"}
              size="sm"
              onClick={handleSelectMode}
            >
              <ListCheck />
              {isSelectMode ? uiText("common.cancel") : uiText("common.select")}
            </Button>
            {isSelectMode && (
              <DeleteDialog
                count={selectedScenes.size}
                onDelete={handleDeleteSelected}
                disabled={isMainSceneSelected}
                trigger={
                  <Button
                    className="rounded-md"
                    variant="destructive"
                    disabled={isMainSceneSelected}
                    size="sm"
                  >
                    <Trash2 />{uiText("video-editor.delete")}{selectedScenes.size})
                  </Button>
                }
              />
            )}
          </div>
          {scenes.length === 0 ? (
            <div className="text-muted-foreground text-sm">{uiText("video-editor.no.scenes.available")}{" "}</div>
          ) : (
            <div className="space-y-2">
              {scenes.map((scene) => (
                <Button
                  key={scene.id}
                  variant="outline"
                  className={cn(
                    "w-full justify-between font-normal",
                    currentScene?.id === scene.id &&
                      !isSelectMode &&
                      "border-primary !text-primary",
                    isSelectMode &&
                      selectedScenes.has(scene.id) &&
                      "bg-accent border-foreground/30",
                  )}
                  onClick={() => handleSceneSwitch(scene.id)}
                >
                  <span>{scene.name}</span>
                  <div className="flex items-center gap-2">
                    {((isSelectMode && selectedScenes.has(scene.id)) ||
                      (!isSelectMode && currentScene?.id === scene.id)) && (
                      <Check className="size-4" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DeleteDialog({
  count,
  onDelete,
  disabled,
  trigger,
}: {
  count: number;
  onDelete: () => void;
  disabled?: boolean;
  trigger: React.ReactNode;
}) {
  useUiLocale();
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    onDelete();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{uiText("video-editor.delete.scenes")}</DialogTitle>
          <DialogDescription>{uiText("video-editor.are.you.sure.you.want.to.delete")}{" "}{count}{" "}{uiText("video-editor.scene")}{" "}{count === 1 ? "" : "s"}{uiText("video-editor.this.action.cannot.be.undone")}{" "}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>{uiText("common.cancel")}{" "}</Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={disabled}
          >{uiText("common.delete")}{" "}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
