import { t as uiText, useLocale as useUiLocale } from "@storyteller/common";
import { FilterEngineCategories } from "@storyteller/api";
import { Button } from "@storyteller/ui-button";
interface Props {
  onCancel: () => void;
  onRetry: () => void;
  type: FilterEngineCategories | string;
  errorMessage?: string;
}

export const UploadAssetError = ({
  onCancel,
  onRetry,
  type,
  errorMessage,
}: Props) => {
  useUiLocale();
  return (
    <>
      <h3>{uiText("upload-modal.error.in.uploading")}{" "}{type}</h3>
      <p>{errorMessage ?? uiText("desktop.unknown.error")}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button onClick={onCancel} variant="secondary">{uiText("common.cancel")}{" "}</Button>
        <Button onClick={onRetry} variant="primary">{uiText("common.try.again")}{" "}</Button>
      </div>
    </>
  );
};
