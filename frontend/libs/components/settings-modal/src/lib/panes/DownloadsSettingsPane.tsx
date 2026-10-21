import { t as uiText, useLocale as useUiLocale } from "@storyteller/common";
import { useEffect, useState } from "react";
import { Button } from "@storyteller/ui-button";
import {
  AppPreferencesPayload,
  CustomDirectory,
  DownloadDirectoryReveal,
  GetAppPreferences,
  PreferenceName,
  PreferredDownloadFilename,
  SystemDirectory,
  UpdateAppPreferences,
  getAskLocationBeforeDownload,
  setAskLocationBeforeDownload,
} from "@storyteller/tauri-api";
import { open } from "@tauri-apps/plugin-dialog";
import { Label } from "@storyteller/ui-label";
import { Switch } from "@storyteller/ui-switch";
import { Select } from "@storyteller/ui-select";
import { FolderIcon, RotateCcwIcon, SearchIcon } from "lucide-react";

const DEFAULT_CUSTOM_FORMAT = "{model}_{date}";
const FILENAME_OPTIONS = [
  { value: "artcraft_convention", get label() { return uiText("settings-modal.artcraft.convention"); } },
  { value: "custom", get label() { return uiText("common.custom.format"); } },
];

export const DownloadsSettingsPane = () => {
  useUiLocale();
  const [preferences, setPreferences] = useState<
    AppPreferencesPayload | undefined
  >(undefined);
  const [filenameMode, setFilenameMode] = useState("artcraft_convention");
  const [customFormat, setCustomFormat] = useState(DEFAULT_CUSTOM_FORMAT);
  const [formatError, setFormatError] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [askLocationBeforeDownload, setAskLocationBeforeDownloadState] =
    useState<boolean>(() => getAskLocationBeforeDownload());

  const toggleAskLocationBeforeDownload = (enabled: boolean) => {
    setAskLocationBeforeDownload(enabled);
    setAskLocationBeforeDownloadState(enabled);
  };

  useEffect(() => {
    const fetchData = async () => {
      const prefs = await GetAppPreferences();
      setPreferences(prefs.preferences);
      const filename = prefs.preferences.preferred_download_filename;
      if (filename && typeof filename === "object") {
        setFilenameMode("custom");
        setCustomFormat(filename.custom_format);
      }
    };
    fetchData().catch((error) => setSettingsError(String(error)));
  }, []);

  // NB: This might be a complex type.
  const outerDownloadObject = preferences?.preferred_download_directory || {};
  const downloadDirectory =
    "custom" in outerDownloadObject
      ? (outerDownloadObject.custom as string)
      : "";
  const currentDownloadLabel =
    "system" in outerDownloadObject
      ? uiText("desktop.system.download.directory")
      : downloadDirectory;

  const reloadPreferences = async () => {
    const prefs = await GetAppPreferences();
    setPreferences(prefs.preferences);
  };

  const openDirectoryPicker = async () => {
    let directory = await open({
      multiple: false,
      directory: true,
      defaultPath: downloadDirectory || undefined,
    });
    if (directory === null) {
      return; // User dismissed the dialog choice
    }
    await UpdateAppPreferences({
      preference: PreferenceName.PreferredDownloadDirectory,
      value: {
        custom: directory,
      } as CustomDirectory,
    });
    await reloadPreferences();
  };

  const clearDirectory = async () => {
    await UpdateAppPreferences({
      preference: PreferenceName.PreferredDownloadDirectory,
      value: {
        system: "downloads",
      } as SystemDirectory,
    });
    await reloadPreferences();
  };

  const showDirectory = async () => {
    await DownloadDirectoryReveal();
  };

  const toggleAutoDownload = async (enabled: boolean) => {
    setSaving(true);
    setSettingsError(null);
    try {
      await UpdateAppPreferences({ preference: PreferenceName.AutoDownload, value: enabled });
      await reloadPreferences();
    } catch (error) {
      setSettingsError(String(error));
    } finally {
      setSaving(false);
    }
  };

  const saveFilenamePreference = async (value: PreferredDownloadFilename) => {
    setSaving(true);
    setFormatError(null);
    try {
      await UpdateAppPreferences({ preference: PreferenceName.PreferredDownloadFilename, value });
      await reloadPreferences();
      setFilenameMode(typeof value === "string" ? value : "custom");
    } catch (error) {
      setFormatError(String(error));
    } finally {
      setSaving(false);
    }
  };

  const saveCustomFormat = async () => {
    const format = customFormat.trim();
    if (!format) {
      setFormatError(uiText("desktop.format.cannot.be.empty"));
      return;
    }
    if (/[/\\'"`%<>|:*?\x00-\x1f\x7f]/.test(format) || format.includes("..")) {
      setFormatError(uiText("desktop.format.cannot.contain.slashes.quotes.or.other.unsafe.characters"));
      return;
    }
    await saveFilenamePreference({ custom_format: format });
  };

  return (
    <div className="space-y-4 pt-3 text-base-fg">
      {settingsError && <p role="alert" className="text-red-400">{settingsError}</p>}
      <div className="space-y-2">
        <Label htmlFor="download-path">{uiText("settings-modal.default.download.directory")}</Label>
        <p className="text-xs opacity-70">{uiText("settings-modal.this.is.where.downloads.are.placed.after.downloading.the.current.path.is")}{" "}</p>
        <div className="mt-1 border border-ui-panel-border bg-ui-sunken px-3 py-2 text-base-fg">
          <pre className="whitespace-pre-wrap break-all font-mono text-xs">
            {currentDownloadLabel}
          </pre>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={openDirectoryPicker}>
          <FolderIcon />{uiText("settings-modal.choose.directory")}{" "}</Button>
        <Button variant="destructive" onClick={clearDirectory}>
          <RotateCcwIcon />{uiText("settings-modal.use.default")}{" "}</Button>
        <Button variant="secondary" onClick={showDirectory}>
          <SearchIcon />{uiText("settings-modal.show.directory")}{" "}</Button>
      </div>
      <div className="flex flex-col gap-2 pt-3">
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="auto-download">{uiText("common.auto.download")}</Label>
          <p className="text-xs opacity-70">{uiText("settings-modal.downloads.to.your.system.the.minute.generations.complete")}{" "}</p>
        </div>
        <Switch
          id="auto-download"
          label={uiText("common.auto.download")}
          enabled={preferences?.auto_download ?? false}
          setEnabled={toggleAutoDownload}
          disabled={!preferences || saving}
        />
      </div>
      <div className="flex flex-col gap-2 pt-3">
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="ask-location-before-download">{uiText("common.ask.location.before.download")}{" "}</Label>
          <p className="text-xs opacity-70">{uiText("settings-modal.when.on.a.system.file.picker.appears.every.time.you.download.from.the.lightbox.or.any")}{" "}</p>
        </div>
        <Switch
          id="ask-location-before-download"
          label={uiText("common.ask.location.before.download")}
          enabled={askLocationBeforeDownload}
          setEnabled={toggleAskLocationBeforeDownload}
        />
      </div>
      <fieldset disabled={!preferences || saving} className="flex flex-col gap-2 border-0 p-0">
        <Label htmlFor="download-filename-mode">{uiText("settings-modal.preferred.download.naming.scheme")}</Label>
        <p className="text-xs opacity-70">
          {uiText("settings-modal.the.artcraft.convention.is.value.value.value.with.a.batch.number.when.a.generation.pr", { model: "{model}", date: "{date}", ext: "{ext}" })}
        </p>
        <div className="max-w-xs">
          <Select
            id="download-filename-mode"
            options={FILENAME_OPTIONS}
            value={filenameMode}
            onChange={(value) => {
              setFormatError(null);
              if (value === "custom") {
                setFilenameMode("custom");
              } else {
                saveFilenamePreference("artcraft_convention");
              }
            }}
          />
        </div>
        {filenameMode === "custom" && (
          <>
            <Label htmlFor="download-filename-format">{uiText("common.custom.format")}</Label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                id="download-filename-format"
                type="text"
                value={customFormat}
                onChange={(event) => setCustomFormat(event.target.value)}
                placeholder={DEFAULT_CUSTOM_FORMAT}
                spellCheck={false}
                className="min-w-0 flex-1 rounded-[3px] border border-ui-controls-border bg-ui-controls px-3 py-2 font-mono text-xs outline-none focus:border-base-fg/40"
              />
              <Button variant="secondary" onClick={saveCustomFormat}>{uiText("settings-modal.save.format")}</Button>
            </div>
            <p className="text-xs opacity-70">
              {uiText("settings-modal.tokens.value.value.value.value.value.value.value.value.value.value.the.file.extension", { model: "{model}", date: "{date}", YYYY: "{YYYY}", YY: "{YY}", MM: "{MM}", DD: "{DD}", HH: "{HH}", mm: "{mm}", SS: "{SS}", batch_index: "{batch_index}" })}
            </p>
            <p className="text-xs opacity-70">{uiText("settings-modal.changes.apply.after.you.click.save.format")}</p>
          </>
        )}
        {formatError && <p role="alert" className="text-xs text-red-400">{formatError}</p>}
      </fieldset>
    </div>
  );
};
