import { t as uiText, useLocale as useUiLocale } from "@storyteller/common";
import { useState } from "react";
import { Label } from "@storyteller/ui-label";
import { Switch } from "@storyteller/ui-switch";
import { gtagEvent } from "@storyteller/google-analytics";
import { useExperimentalStore } from "../experimental-store";
import { ExperimentalConfirmModal } from "../ExperimentalConfirmModal";

interface Props {
  // Called immediately before the storyboard flag flips off, so the host app
  // can reset page state and navigate away from the soon-to-be-hidden tab.
  onStoryboardPageDisable?: () => void;
}

export const ExperimentalSettingsPane = ({ onStoryboardPageDisable }: Props) => {
  useUiLocale();
  const storyboardPageEnabled = useExperimentalStore(
    (s) => s.storyboardPageEnabled,
  );
  const setStoryboardPageEnabled = useExperimentalStore(
    (s) => s.setStoryboardPageEnabled,
  );
  const [isDisableConfirmOpen, setIsDisableConfirmOpen] = useState(false);

  const fireToggleEvent = (enabled: boolean) => {
    gtagEvent("toggle_experimental_feature", {
      feature: "storyboard_page",
      enabled: String(enabled),
    });
  };

  const handleStoryboardToggle = (enabled: boolean) => {
    if (enabled) {
      setStoryboardPageEnabled(true);
      fireToggleEvent(true);
    } else {
      setIsDisableConfirmOpen(true);
    }
  };

  const handleConfirmDisable = () => {
    onStoryboardPageDisable?.();
    setStoryboardPageEnabled(false);
    fireToggleEvent(false);
    setIsDisableConfirmOpen(false);
  };

  return (
    <>
      <div className="space-y-4 text-base-fg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <Label htmlFor="experimental-storyboard-page">{uiText("settings-modal.storyboard.page")}</Label>
            <p className="text-xs opacity-70">{uiText("settings-modal.show.the.storyboard.page.in.the.apps.menu.in.development.expect.rough.edges")}{" "}</p>
          </div>
          <Switch
            enabled={storyboardPageEnabled}
            setEnabled={handleStoryboardToggle}
          />
        </div>
      </div>
      <ExperimentalConfirmModal
        isOpen={isDisableConfirmOpen}
        onClose={() => setIsDisableConfirmOpen(false)}
        onConfirm={handleConfirmDisable}
        title={uiText("settings-modal.disable.storyboard.page")}
        text={uiText("settings-modal.the.storyboard.page.will.be.reset.and.any.unsaved.changes.will.be.lost")}
        confirmText={uiText("settings-modal.disable")}
      />
    </>
  );
};
