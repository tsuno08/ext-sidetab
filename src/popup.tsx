import React, { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { IMessage, ISettings } from "./types";
import { DEFAULT_SETTINGS, getSettings, updateSettings } from "./utils/storage";
import "./popup.css";

const Popup: React.FC = () => {
  const sidebarWidthRef = useRef<HTMLInputElement>(null);
  const fontSizeRef = useRef<HTMLInputElement>(null);
  const darkModeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const s = await getSettings();

      // 初期値を設定
      if (sidebarWidthRef.current) {
        sidebarWidthRef.current.value = s.sidebarWidth.toString();
      }
      if (fontSizeRef.current) {
        fontSizeRef.current.value = s.fontSize.toString();
      }
      if (darkModeRef.current) {
        darkModeRef.current.checked = s.darkMode;
      }
      document.body.classList.toggle("dark-mode", s.darkMode);
    })();
  }, []);

  const handleSave = async () => {
    if (
      !sidebarWidthRef.current ||
      !fontSizeRef.current ||
      !darkModeRef.current
    )
      return;

    const newSettings: ISettings = {
      sidebarWidth:
        Number(sidebarWidthRef.current.value) || DEFAULT_SETTINGS.sidebarWidth,
      fontSize: Number(fontSizeRef.current.value) || DEFAULT_SETTINGS.fontSize,
      darkMode: darkModeRef.current.checked,
    };

    await updateSettings(newSettings);

    // コンテンツスクリプトに設定変更を通知
    const message: IMessage = {
      type: "UPDATE_SETTINGS",
      settings: newSettings,
    };
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]?.id) {
      await chrome.tabs.sendMessage(tabs[0].id, message);
    }

    // ダークモードの即時反映
    document.body.classList.toggle("dark-mode", newSettings.darkMode);
  };

  return (
    <div className="settings-container">
      <h2 className="settings-title">設定</h2>
      <div className="settings-form">
        <div className="form-group">
          <label className="form-label">サイドバーの幅 (px)</label>
          <input
            type="number"
            ref={sidebarWidthRef}
            defaultValue={DEFAULT_SETTINGS.sidebarWidth}
            className="form-input"
            min="100"
            max="800"
          />
        </div>
        <div className="form-group">
          <label className="form-label">フォントサイズ (px)</label>
          <input
            type="number"
            ref={fontSizeRef}
            defaultValue={DEFAULT_SETTINGS.fontSize}
            className="form-input"
            min="8"
            max="24"
          />
        </div>
        <div className="checkbox-group">
          <input
            type="checkbox"
            id="darkMode"
            ref={darkModeRef}
            defaultChecked={DEFAULT_SETTINGS.darkMode}
            className="checkbox-input"
          />
          <label htmlFor="darkMode" className="checkbox-label">
            ダークモード
          </label>
        </div>
        <button className="save-button" onClick={handleSave}>
          保存
        </button>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<Popup />);
