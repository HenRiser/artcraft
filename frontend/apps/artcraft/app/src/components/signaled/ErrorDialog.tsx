import { t as uiText, useLocale as useUiLocale } from "@storyteller/common";
import { TriangleAlertIcon } from "lucide-react";
import { useShallow } from "zustand/shallow";

import { Modal } from "@storyteller/ui-modal";
import { Button } from "@storyteller/ui-button";
import { usePageSceneStore } from "@storyteller/ui-pagescene";

export function ErrorDialog() {
  useUiLocale();
  const { showErrorDialog, errorDialogTitle, errorDialogMessage, setShowErrorDialog } =
    usePageSceneStore(
      useShallow((s) => ({
        showErrorDialog: s.showErrorDialog,
        errorDialogTitle: s.errorDialogTitle,
        errorDialogMessage: s.errorDialogMessage,
        setShowErrorDialog: s.setShowErrorDialog,
      })),
    );

  return (
    <Modal
      title={errorDialogTitle}
      titleIcon={TriangleAlertIcon}
      titleIconClassName="text-red-400"
      isOpen={showErrorDialog}
      onClose={() => setShowErrorDialog(false)}
      showClose={false}
    >
      <div>
        {errorDialogMessage}
        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            onClick={() => setShowErrorDialog(false)}
            variant="secondary"
          >{uiText("common.close")}{" "}</Button>
        </div>
      </div>
    </Modal>
  );
}
