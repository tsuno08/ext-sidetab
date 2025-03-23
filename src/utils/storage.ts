import { Settings } from "../types";

const DEFAULT_SETTINGS: Settings = {
  sidebarWidth: 280,
  darkMode: false,
  fontSize: 14,
};

export const getSettings = async (): Promise<Settings> => {
  const result = await chrome.storage.sync.get("settings");
  return result.settings || DEFAULT_SETTINGS;
};

export const updateSettings = async (
  settings: Partial<Settings>
): Promise<void> => {
  const currentSettings = await getSettings();
  await chrome.storage.sync.set({
    settings: { ...currentSettings, ...settings },
  });
};
