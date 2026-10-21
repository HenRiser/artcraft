import { t as uiText, useLocale as useUiLocale } from "@storyteller/common";
import { useState } from "react";
import { BoxIcon, WandSparklesIcon } from "lucide-react";
import { Button } from "@storyteller/ui-button";
import { Tooltip } from "@storyteller/ui-tooltip";
import { AssetModal } from "./AssetModal";
import { usePageSceneStore } from "../../PageSceneStore";

export const AssetMenu = () => {
  useUiLocale();
  const [, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    const store = usePageSceneStore.getState();
    store.setAssetModalVisibleDuringDrag(true);
    store.setAssetModalVisible(true);
    // Clear any leftover drag-under state so the panel opens fully shown (a
    // reopen-off drag leaves it faded-hidden until the next open).
    store.setAssetDraggingUnder(false);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="glass absolute left-2 top-1/2 flex -translate-y-1/2 flex-col gap-1 rounded-lg p-1">
        <Tooltip content={uiText("pagescene.add.3d.object.to.scene")} position="right" delay={100}>
          <Button
            icon={BoxIcon}
            className="h-12 w-12 text-lg"
            onClick={handleOpenModal}
          />
        </Tooltip>
        <Tooltip
          content={uiText("common.create.3d.model.from.image")}
          position="right"
          delay={100}
        >
          <Button
            icon={WandSparklesIcon}
            className="h-12 w-12 text-lg"
            variant="secondary"
            disabled={true}
            onClick={handleOpenModal}
          />
        </Tooltip>
      </div>

      <AssetModal />
    </>
  );
};
