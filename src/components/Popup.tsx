import React, { useEffect, useState } from "react";
import { Settings, Message } from "../types";
import { getSettings, updateSettings } from "../utils/storage";

export const Popup: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    sidebarWidth: 280,
    darkMode: false,
    fontSize: 14,
  });

  useEffect(() => {
    (async () => {
      const s = await getSettings();
      setSettings(s);
      document.body.classList.toggle("dark-mode", s.darkMode);
    })();
  }, []);

  const handleChange = async (
    key: keyof Settings,
    value: Settings[keyof Settings]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await updateSettings(newSettings);

    if (key === "darkMode") {
      document.body.classList.toggle("dark-mode", value as boolean);
    }

    // コンテンツスクリプトに設定変更を通知
    const message: Message = {
      type: "UPDATE_SETTINGS",
      settings: newSettings,
    };
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]?.id) {
      await chrome.tabs.sendMessage(tabs[0].id, message);
    }
  };

  return (
    <div className="settings-container">
      <h2 className="settings-title">設定</h2>
      <div className="settings-form">
        <div className="form-group">
          <label className="form-label">サイドバーの幅 (px)</label>
          <input
            type="number"
            value={settings.sidebarWidth}
            onChange={(e) =>
              handleChange("sidebarWidth", Number(e.target.value))
            }
            className="form-input"
            min="200"
            max="500"
          />
        </div>
        <div className="form-group">
          <label className="form-label">フォントサイズ (px)</label>
          <input
            type="number"
            value={settings.fontSize}
            onChange={(e) => handleChange("fontSize", Number(e.target.value))}
            className="form-input"
            min="12"
            max="20"
          />
        </div>
        <div className="checkbox-group">
          <input
            type="checkbox"
            id="darkMode"
            checked={settings.darkMode}
            onChange={(e) => handleChange("darkMode", e.target.checked)}
            className="checkbox-input"
          />
          <label htmlFor="darkMode" className="checkbox-label">
            ダークモード
          </label>
        </div>
      </div>
    </div>
  );
};
