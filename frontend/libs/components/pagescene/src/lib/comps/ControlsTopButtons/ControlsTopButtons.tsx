import { t as uiText, useLocale as useUiLocale } from "@storyteller/common";
import React, { useCallback, useContext, useState } from "react";
import { FileIcon, KeyboardIcon, SquareCheckIcon, SquareIcon } from "lucide-react";
import { ButtonDropdown } from "@storyteller/ui-button-dropdown";
import { Input } from "@storyteller/ui-input";
import { Button } from "@storyteller/ui-button";
import { useCheatsheetPin } from "@storyteller/keybinds";
import { twMerge } from "tailwind-merge";

import { EngineContext } from "../../contexts/EngineContext/EngineContext";
import {
  usePageSceneStore,
  useIsVisitingOthersScene,
} from "../../PageSceneStore";
import { DEFAULT_CAMERA_ASPECT_RATIO, ToastTypes } from "../../enums";
import { getSceneGenerationMetaData } from "../../sceneMetadata";
import { LoadUserScenes } from "./LoadUserScenes";

import { TOOLBAR_BUTTON_CLASS_NAME } from "../toolbarStyles";

const isNumberString = (s: string): boolean => /^\d+$/.test(s);

export const ControlsTopButtons = () => {
  useUiLocale();
  const editor = useContext(EngineContext);
  const cheatsheetPinned = useCheatsheetPin((s) => s.pinned);
  const toggleCheatsheet = useCheatsheetPin((s) => s.togglePinned);

  const sceneMeta = usePageSceneStore((s) => s.sceneMeta);
  const currentUserToken = usePageSceneStore((s) => s.currentUserToken);
  const outlinerShowing = usePageSceneStore((s) => s.outlinerShowing);
  const isVisitingOthersScene = useIsVisitingOthersScene();

  const [sceneTitleInput, setSceneTitleInput] = useState<string>(
    sceneMeta.title || "",
  );
  const [sceneTokenSelected, setSceneTokenSelected] = useState<string>("");

  // Keep the scene-title input in sync with the loaded scene's title.
  // The host wrapper (PageScene.tsx) drives the URL ↔ token bookkeeping;
  // here we only mirror the title for the Save-as-copy dialog.
  React.useEffect(() => {
    if (!sceneMeta.isInitializing && sceneMeta.title !== undefined) {
      setSceneTitleInput(sceneMeta.title);
    }
  }, [sceneMeta.isInitializing, sceneMeta.title]);

  const handleChangeSceneTitleInput = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSceneTitleInput(e.target.value);
  };

  const handleResetScene = () => {
    editor?.cameraController.changeRenderCameraAspectRatio(
      DEFAULT_CAMERA_ASPECT_RATIO,
    );
  };

  const handleButtonSave = async () => {
    if (!editor) {
      // No-op without an editor; the toast is informational only.
      return;
    }
    if (!currentUserToken && editor.adapter.promptSignup) {
      editor.adapter.promptSignup("save");
      return;
    }
    const sceneGenerationMetadata = getSceneGenerationMetaData(editor);

    const retSceneMediaToken = await editor.saveScene({
      sceneTitle: sceneMeta.title || "",
      sceneToken: sceneMeta.token,
      sceneGenerationMetadata,
    });

    if (retSceneMediaToken === "") {
      editor.adapter.showToast(
        ToastTypes.ERROR,
        uiText("desktop.failed.to.save.scene.try.again.later"),
      );
    }

    if (retSceneMediaToken) {
      editor.adapter.showToast(ToastTypes.SUCCESS, retSceneMediaToken);
      if (!sceneMeta.token) {
        editor.adapter.onSceneTitleChange?.({
          title: sceneMeta.title || "",
          token: retSceneMediaToken,
          ownerToken: sceneMeta.ownerToken,
          isModified: false,
        });
      }
    }
  };

  // In-place save that takes the name from the prompt input rather than
  // sceneMeta.title. Used for brand-new scenes (sceneMeta.token
  // undefined → UploadNewScene) and for saved scenes that never got a
  // real title. Mirrors the saved meta back through onSceneTitleChange
  // so the store/header pick up the new name + token.
  const handleButtonSaveWithName = async () => {
    if (!editor) return;
    if (!currentUserToken && editor.adapter.promptSignup) {
      editor.adapter.promptSignup("save");
      return;
    }
    const sceneGenerationMetadata = getSceneGenerationMetaData(editor);
    const retSceneMediaToken = await editor.saveScene({
      sceneTitle: sceneTitleInput,
      sceneToken: sceneMeta.token,
      sceneGenerationMetadata,
    });

    if (retSceneMediaToken === "") {
      editor.adapter.showToast(
        ToastTypes.ERROR,
        uiText("desktop.failed.to.save.scene.try.again.later"),
      );
      return;
    }

    if (retSceneMediaToken) {
      editor.adapter.showToast(ToastTypes.SUCCESS, retSceneMediaToken);
      editor.adapter.onSceneTitleChange?.({
        title: sceneTitleInput,
        token: retSceneMediaToken,
        ownerToken: sceneMeta.ownerToken ?? currentUserToken,
        isModified: false,
      });
    }
  };

  const handleButtonSaveAsCopy = useCallback(async () => {
    if (!editor) return;
    if (!currentUserToken && editor.adapter.promptSignup) {
      editor.adapter.promptSignup("save");
      return;
    }
    const sceneGenerationMetadata = getSceneGenerationMetaData(editor);
    const retSceneMediaToken = await editor.saveScene({
      sceneTitle: sceneTitleInput,
      sceneToken: undefined,
      sceneGenerationMetadata,
    });
    if (retSceneMediaToken) {
      editor.adapter.showToast(ToastTypes.SUCCESS, retSceneMediaToken);
      editor.adapter.onSceneTitleChange?.({
        title: sceneTitleInput,
        token: retSceneMediaToken,
        ownerToken: currentUserToken,
        isModified: false,
      });
    }
  }, [sceneTitleInput, editor, currentUserToken]);

  const handleButtonLoadScene = () => {
    handleResetScene();
    editor?.loadScene(sceneTokenSelected).catch((err) => {
      editor.adapter.showToast(ToastTypes.ERROR, err.message);
    });
  };

  const handleSceneSelection = (token: string) => {
    setSceneTokenSelected(token);
  };

  const handleShowOutliner = () => {
    usePageSceneStore.getState().setOutlinerShowing(!outlinerShowing);
  };

  // Any logged-in user can save — saving an unmodified scene is valid
  // (re-save, "favorite to my account" fork via Save-as-copy for
  // visitors). We deliberately do NOT require sceneMeta.isModified;
  // dirty-tracking isn't plumbed end-to-end and saving shouldn't depend
  // on it. Anon still falls through to the signup CTA branch below.
  const canSave = !!currentUserToken;

  // A scene needs a name prompt before saving when it's brand-new (no
  // token) or has no usable title yet. Already-named saved scenes save
  // silently in place.
  const sceneHasName = !!sceneMeta.title && sceneMeta.title.trim() !== "";
  const needsNameToSave = !sceneMeta.token || !sceneHasName;

  // The Save-as-copy "(1)" rename hint runs onDialogOpen for both the
  // visitor's primary "Save copy" item AND the owner's standalone
  // "Save scene as copy" item, so it lives in a single closure.
  const bumpCopyCountInTitle = () => {
    const copyCountStr = sceneTitleInput.substring(
      sceneTitleInput.lastIndexOf("(") + 1,
      sceneTitleInput.length - 1,
    );
    if (isNumberString(copyCountStr)) {
      const newCopyCountStr = String(Number(copyCountStr) + 1);
      setSceneTitleInput(
        sceneTitleInput.replace(copyCountStr, newCopyCountStr),
      );
    } else {
      setSceneTitleInput(sceneTitleInput + " (1)");
    }
  };

  const saveAsCopyDialogProps = {
    title: isVisitingOthersScene
      ? uiText("desktop.save.a.copy.to.your.account")
      : uiText("desktop.save.scene.as.copy"),
    content: (
      <Input
        value={sceneTitleInput}
        label={uiText("common.please.enter.a.name.for.your.scene")}
        onChange={handleChangeSceneTitleInput}
      />
    ),
    confirmButtonProps: {
      get label() { return uiText("common.save"); },
      disabled: sceneTitleInput === "",
      onClick: handleButtonSaveAsCopy,
    },
    closeButtonProps: { get label() { return uiText("common.cancel"); } },
    showClose: true,
  };

  // Name prompt for the owner's first save of a new/unnamed scene.
  // Same input as the copy dialog, but the confirm performs the
  // in-place save under sceneMeta.token (undefined → create new).
  const saveWithNameDialogProps = {
    get title() { return uiText("pagescene.save.scene"); },
    content: (
      <Input
        value={sceneTitleInput}
        label={uiText("common.please.enter.a.name.for.your.scene")}
        onChange={handleChangeSceneTitleInput}
      />
    ),
    confirmButtonProps: {
      get label() { return uiText("common.save"); },
      disabled: sceneTitleInput.trim() === "",
      onClick: handleButtonSaveWithName,
    },
    closeButtonProps: { get label() { return uiText("common.cancel"); } },
    showClose: true,
  };

  return (
    <div className="flex flex-col gap-2 pl-3 pt-3">
      <div className="flex items-center gap-1.5">
        <ButtonDropdown
          label={uiText("pagescene.file")}
          icon={FileIcon}
          className={TOOLBAR_BUTTON_CLASS_NAME}
          options={[
            {
              get label() { return uiText("pagescene.new.scene"); },
              description: "Ctrl+N",
              // Hosts that own a New-Scene chooser (e.g. the webapp's
              // splash modal) wire `onRequestNewSceneSelector` and take
              // over confirm + action. Without it (Tauri), we fall back
              // to the inline confirm dialog.
              ...(editor?.adapter.onRequestNewSceneSelector
                ? {
                    onClick: () => editor.adapter.onRequestNewSceneSelector?.(),
                  }
                : {
                    dialogProps: {
                      get title() { return uiText("pagescene.create.new.scene"); },
                      content: (
                        <h4>{uiText("pagescene.make.sure.you.apos.ve.saved.your.scene.unsaved.changes.will.be.lost.continue")}{" "}</h4>
                      ),
                      confirmButtonProps: {
                        get label() { return uiText("pagescene.create.new.scene.2"); },
                        onClick: async () => {
                          handleResetScene();
                          const defaultTitle = "Untitled New Scene";
                          setSceneTitleInput(defaultTitle);
                          await editor?.newScene(defaultTitle);
                        },
                      },
                      closeButtonProps: { get label() { return uiText("common.cancel"); } },
                      showClose: true,
                    },
                  }),
            },
            {
              get label() { return uiText("pagescene.load.my.scene"); },
              description: "Ctrl+O",
              ...(currentUserToken
                ? {
                    dialogProps: {
                      get title() { return uiText("pagescene.load.a.saved.scene"); },
                      content: (
                        <LoadUserScenes onSceneSelect={handleSceneSelection} />
                      ),
                      confirmButtonProps: {
                        get label() { return uiText("pagescene.load"); },
                        disabled: sceneTokenSelected === "",
                        onClick: handleButtonLoadScene,
                      },
                      closeButtonProps: { get label() { return uiText("common.cancel"); } },
                      showClose: true,
                      className: "max-w-5xl",
                    },
                  }
                : {
                    onClick: () => editor?.adapter.promptSignup?.("load"),
                  }),
            },
            // Primary Save item. For visitors of someone else's scene
            // it relabels to "Save copy" and reuses the Save-as-copy
            // dialog (forks the scene to the visitor's account). Anon
            // skips the dialog entirely and goes straight to the
            // signup CTA, so we wire onClick instead of dialogProps in
            // that branch.
            {
              disabled: !canSave,
              label: isVisitingOthersScene ? "Save copy" : "Save scene",
              description: "Ctrl+S",
              ...(!currentUserToken
                ? {
                    onClick: () => editor?.adapter.promptSignup?.("save"),
                  }
                : isVisitingOthersScene
                  ? {
                      onDialogOpen: bumpCopyCountInTitle,
                      dialogProps: saveAsCopyDialogProps,
                    }
                  : needsNameToSave
                    ? { dialogProps: saveWithNameDialogProps }
                    : { onClick: handleButtonSave }),
              divider: true,
            },
            // Standalone "Save scene as copy" — owners only. Visitors
            // already get this behavior from the primary Save item;
            // showing both would be redundant.
            ...(isVisitingOthersScene
              ? []
              : [
                  {
                    disabled: !currentUserToken || !sceneMeta.token,
                    get label() { return uiText("pagescene.save.scene.as.copy"); },
                    onDialogOpen: bumpCopyCountInTitle,
                    dialogProps: saveAsCopyDialogProps,
                  },
                ]),
            // Reset-to-original — destructive, only meaningful when a
            // sceneToken is in play (URL-loaded scene) AND the host
            // implements the reset adapter (the webapp does via its
            // per-token cache; Tauri leaves it undefined and the item
            // simply doesn't render).
            ...(sceneMeta.token && editor?.adapter.resetToOriginal
              ? [
                  {
                    get label() { return uiText("pagescene.reset.to.original"); },
                    className:
                      "text-error-400 hover:bg-error-500/15 focus:bg-error-500/15",
                    divider: true,
                    dialogProps: {
                      get title() { return uiText("pagescene.reset.scene.to.original"); },
                      content: (
                        <p>{uiText("pagescene.this.will.discard.every.change.you.apos.ve.made.in.this.session.and.restore.the.scene")}{" "}</p>
                      ),
                      confirmButtonProps: {
                        get label() { return uiText("common.reset"); },
                        variant: "destructive" as const,
                        onClick: async () => {
                          await editor.adapter.resetToOriginal?.();
                        },
                      },
                      closeButtonProps: { get label() { return uiText("common.cancel"); } },
                      showClose: true,
                    },
                  },
                ]
              : []),
          ]}
        />

        <Button
          icon={outlinerShowing ? SquareCheckIcon : SquareIcon}
          className={TOOLBAR_BUTTON_CLASS_NAME}
          iconClassName={twMerge(
            "text-[16px]",
            outlinerShowing ? "text-white" : "text-white/20",
          )}
          variant="secondary"
          onClick={handleShowOutliner}
        >{uiText("pagescene.outliner")}{" "}</Button>

        {/* Pins the live keybinds cheatsheet (rendered by Stage3DBody) open
            until Esc / click outside / this button again. data-cheatsheet-toggle
            exempts it from the overlay's click-outside dismissal so the second
            click reads as "close", not "close then reopen". */}
        <Button
          icon={KeyboardIcon}
          variant="secondary"
          className={TOOLBAR_BUTTON_CLASS_NAME}
          iconClassName={twMerge(
            "text-[16px]",
            cheatsheetPinned ? "text-white" : "text-white/20",
          )}
          onClick={toggleCheatsheet}
          data-cheatsheet-toggle
        >{uiText("common.shortcuts")}{" "}</Button>
      </div>
    </div>
  );
};
