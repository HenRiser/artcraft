import { t as uiText, useLocale as useUiLocale } from "@storyteller/common";
import { LoadingBar } from "@storyteller/ui-loading";
import { usePageSceneStore } from "../PageSceneStore";

// Driven by `EditorLoaderEvent` on the engine bus — the bridge writes
// to store.editorLoader and this component reads from it. The lib
// owns the loading bar UI; hosts that want a different visual can
// build their own component reading from the same store slice.
export const EditorLoadingBar = () => {
  useUiLocale();
  const editorLoader = usePageSceneStore((s) => s.editorLoader);
  return (
    <LoadingBar
      id="editor-loading-bar"
      show={editorLoader.isShowing}
      wrapperClassName="absolute top-0 left-0 z-[80]"
      innerWrapperClassName="max-w-screen-sm"
      hasSpinner
      progressData={{
        progress: 100,
        get label() { return uiText("common.loading.editor.engine"); },
        message: editorLoader.message ?? "",
      }}
    />
  );
};
