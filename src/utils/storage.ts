import { ISettings } from "../types";

const DEFAULT_SETTINGS: ISettings = {
  sidebarWidth: 280,
  darkMode: false,
  fontSize: 14,
};

export const getSettings = async (): Promise<ISettings> => {
  const result = await chrome.storage.sync.get("settings");
  return result.settings || DEFAULT_SETTINGS;
};

export const updateSettings = async (settings: ISettings): Promise<void> => {
  await chrome.storage.sync.set({ settings });
};
