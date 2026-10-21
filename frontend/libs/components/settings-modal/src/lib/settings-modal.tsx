import { t as uiText, useLocale as useUiLocale } from "@storyteller/common";
import { Modal } from "@storyteller/ui-modal";
import { useEffect, useState } from "react";
import { CreditCardIcon, DownloadIcon, FlaskConicalIcon, InfoIcon, KeyboardIcon, PaletteIcon, SettingsIcon, UserIcon, Volume2Icon } from "lucide-react";
import { DynamicIcon } from "@storyteller/icons";
import { twMerge } from "tailwind-merge";
import { KeybindsSettings } from "@storyteller/keybinds";
import { MiscSettingsPane } from "./panes/MiscSettingsPane";
import { DownloadsSettingsPane } from "./panes/DownloadsSettingsPane";
import { AudioSettingsPane } from "./panes/AudioSettingsPane";
import { AccountSettingsPane } from "./panes/AccountSettings/AccountSettingsPane";
import { AboutSettingsPane } from "./panes/AboutSettingsPane";
import { ProviderPrioritySettingsPane } from "./panes/ProviderPrioritySettingsPane";
import { ExperimentalSettingsPane } from "./panes/ExperimentalSettingsPane";
import { gtagEvent } from "@storyteller/google-analytics";
import { BillingSettingsPane } from "./panes/BillingSettingsPane";
import { AppearanceSettingsPane } from "./panes/AppearanceSettingsPane";
import { Button } from "@storyteller/ui-button";
import { useExperimentalStore } from "./experimental-store";
import { ExperimentalConfirmModal } from "./ExperimentalConfirmModal";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  globalAccountLogoutCallback: () => void;
  onStoryboardPageDisable?: () => void;
  initialSection?: SettingsSection;
}

type SettingsSection =
  | "general"
  | "downloads"
  | "appearance"
  | "keybinds"
  | "accounts"
  | "alerts"
  | "about"
  | "provider_priority"
  | "billing"
  | "experimental";

export const SettingsModal = ({
  isOpen,
  onClose,
  globalAccountLogoutCallback,
  onStoryboardPageDisable,
  initialSection = "general",
}: SettingsModalProps) => {
  useUiLocale();
  const [selectedSection, setSelectedSection] =
    useState<SettingsSection>(initialSection);

  const experimentalEnabled = useExperimentalStore((s) => s.enabled);
  const disableExperimental = useExperimentalStore((s) => s.disable);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Sync the selected section with incoming prop when modal opens or prop changes
  useEffect(() => {
    if (isOpen) {
      setSelectedSection(initialSection);
    }
  }, [isOpen, initialSection]);

  // If experimental gets disabled while user is on that pane, fall back to General
  useEffect(() => {
    if (!experimentalEnabled && selectedSection === "experimental") {
      setSelectedSection("general");
    }
  }, [experimentalEnabled, selectedSection]);

  const sections = [
    { id: "general" as const, get label() { return uiText("settings-modal.general"); }, icon: SettingsIcon },
    { id: "downloads" as const, get label() { return uiText("settings-modal.downloads"); }, icon: DownloadIcon },

    { id: "accounts" as const, get label() { return uiText("settings-modal.accounts"); }, icon: UserIcon },
    { id: "billing" as const, get label() { return uiText("settings-modal.plan.credits"); }, icon: CreditCardIcon },

    /* {
      id: "provider_priority" as const,
      label: "Provider Priority",
      icon: RouteIcon,
    }, */
    { id: "appearance" as const, get label() { return uiText("settings-modal.appearance"); }, icon: PaletteIcon },
    { id: "keybinds" as const, get label() { return uiText("settings-modal.keybinds"); }, icon: KeyboardIcon },
    { id: "alerts" as const, get label() { return uiText("settings-modal.alerts"); }, icon: Volume2Icon },
    { id: "about" as const, get label() { return uiText("settings-modal.about"); }, icon: InfoIcon },
    //{ id: "video" as const, label: "Video", icon: VideoIcon },
    //{ id: "image" as const, label: "Image", icon: ImageIcon },
    ...(experimentalEnabled
      ? [{ id: "experimental" as const, get label() { return uiText("settings-modal.experimental"); }, icon: FlaskConicalIcon }]
      : []),
  ];

  const renderContent = () => {
    switch (selectedSection) {
      case "appearance":
        return <AppearanceSettingsPane />;
      case "keybinds":
        return <KeybindsSettings />;
      case "alerts":
        return <AudioSettingsPane />;
      case "general":
        return <MiscSettingsPane />;
      case "downloads":
        return <DownloadsSettingsPane />;
      case "accounts":
        return (
          <AccountSettingsPane
            globalAccountLogoutCallback={globalAccountLogoutCallback}
          />
        );
      case "about":
        return <AboutSettingsPane />;
      case "provider_priority":
        return <ProviderPrioritySettingsPane />;
      case "billing":
        return <BillingSettingsPane />;
      case "experimental":
        return (
          <ExperimentalSettingsPane
            onStoryboardPageDisable={onStoryboardPageDisable}
          />
        );
    }
  };

  const handleConfirmReset = () => {
    disableExperimental();
    gtagEvent("reset_experimental_menu", {});
    setIsResetConfirmOpen(false);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        className="max-w-4xl"
        childPadding={false}
      >
        <div className="h-[600px]">
          <div className="grid h-full grid-cols-12 gap-3">
            <div className="relative col-span-4 p-3 pt-2 after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-ui-panel-border">
              <div className="flex items-center justify-between gap-2.5 py-0.5">
                <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-base-fg/60">{uiText("common.settings")}{" "}</h2>
              </div>
              <hr className="my-2 w-full border-ui-panel-border" />
              <div className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    className={twMerge(
                      "h-9 w-full px-2 text-left transition-colors duration-100",
                      section.id === selectedSection
                        ? "bg-base-fg/10 text-base-fg"
                        : "text-base-fg/70 hover:bg-base-fg/[0.06] hover:text-base-fg",
                    )}
                    onClick={() => {
                      gtagEvent("switch_settings_section", {
                        section: section.id,
                      });
                      setSelectedSection(section.id);
                    }}
                  >
                    <div className="flex items-center gap-2.5 text-sm">
                      <DynamicIcon icon={section.icon} />
                      {section.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-8 flex h-full flex-col overflow-y-auto relative">
              <div className="w-full border-b border-ui-panel-border py-2.5 ps-0">
                <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-base-fg/80">
                  {sections.find((s) => s.id === selectedSection)?.label}
                </h2>
              </div>
              {experimentalEnabled && selectedSection === "experimental" && (
                <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-ui-panel-border bg-ui-modal px-3 py-2">
                  <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] opacity-80">
                    <FlaskConicalIcon />{uiText("settings-modal.experimental.features.enabled")}{" "}</div>
                  <Button
                    variant="destructive"
                    onClick={() => setIsResetConfirmOpen(true)}
                    className="rounded-[3px] px-2 py-1 text-xs"
                  >{uiText("common.reset")}{" "}</Button>
                </div>
              )}
              <div className="p-3 ps-0 text-sm h-full">{renderContent()}</div>
            </div>
          </div>
        </div>
      </Modal>
      <ExperimentalConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        title={uiText("settings-modal.reset.experimental.settings")}
        text={uiText("settings-modal.this.will.hide.the.experimental.section.and.clear.any.experimental.settings.you.can.u")}
        confirmText={uiText("common.reset")}
      />
    </>
  );
};

export default SettingsModal;
