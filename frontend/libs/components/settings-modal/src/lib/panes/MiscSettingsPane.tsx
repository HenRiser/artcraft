import { t as uiText, useLocale as useUiLocale } from "@storyteller/common";
import { Label } from "@storyteller/ui-label";
import { Switch } from "@storyteller/ui-switch";
import { useEnterToGenerateStore } from "@storyteller/ui-promptbox";
import { useModelPickerStyleStore } from "@storyteller/ui-popover";
import { useKeybindsStore } from "@storyteller/keybinds";

interface MiscSettingsPaneProps {}

export const MiscSettingsPane = (args: MiscSettingsPaneProps) => {
  useUiLocale();
  const enterToGenerate = useEnterToGenerateStore((s) => s.enabled);
  const setEnterToGenerate = useEnterToGenerateStore((s) => s.setEnabled);

  const modelPickerStyle = useModelPickerStyleStore((s) => s.style);
  const setModelPickerStyle = useModelPickerStyleStore((s) => s.setStyle);

  const cheatsheetSticky = useKeybindsStore((s) => s.cheatsheetSticky);
  const setCheatsheetSticky = useKeybindsStore((s) => s.setCheatsheetSticky);

  return (
    <div className="space-y-4 text-base-fg">
      <div className="flex flex-col gap-2 pt-3">
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="enter-to-generate">{uiText("settings-modal.enter.to.generate")}</Label>
          <p className="text-xs opacity-70">{uiText("settings-modal.when.on.pressing.enter.submits.the.prompt.and.shift.enter.adds.a.new.line.when.off.de")}{" "}</p>
        </div>
        <Switch enabled={enterToGenerate} setEnabled={setEnterToGenerate} />
      </div>
      <div className="flex flex-col gap-2 pt-3">
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="group-models-by-family">{uiText("settings-modal.group.models.by.family")}</Label>
          <p className="text-xs opacity-70">{uiText("settings-modal.when.on.default.the.model.picker.groups.models.into.submenus.by.family.like.seedance")}{" "}</p>
        </div>
        <Switch
          enabled={modelPickerStyle === "grouped"}
          setEnabled={(on) => setModelPickerStyle(on ? "grouped" : "flat")}
        />
      </div>
      <div className="flex flex-col gap-2 pt-3">
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="cheatsheet-sticky">{uiText("settings-modal.keep.shortcut.cheatsheet.open")}{" "}</Label>
          <p className="text-xs opacity-70">{uiText("settings-modal.in.the.editors.holding.ctrl.on.mac.alone.for.a.few.seconds.shows.a.cheatsheet.of.the")}{" "}</p>
        </div>
        <Switch enabled={cheatsheetSticky} setEnabled={setCheatsheetSticky} />
      </div>
    </div>
  );
};
