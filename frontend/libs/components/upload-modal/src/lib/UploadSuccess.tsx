import { t as uiText, useLocale as useUiLocale } from "@storyteller/common";
import {
  Button
} from "@storyteller/ui-button"

interface Props {
  title: string;
  onOk: () => void;
}

export const UploadSuccess = ({ title, onOk }: Props) => {
  useUiLocale();
  return (
    <>
      <div className="w-100 text-center opacity-50">{uiText("upload-modal.added.value.to.your.library", { value0: title })}</div>
      <div className="mt-6 flex justify-end gap-2">
        <Button onClick={onOk} variant="primary">{uiText("upload-modal.ok")}{" "}</Button>
      </div>
    </>
  );
};
