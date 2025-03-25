import React from "react";
import { createRoot } from "react-dom/client";
import { Sidebar } from "./components/sidebar";
import { IMessage, ISettings } from "./types";
import { getSettings } from "./utils/storage";
import "./content.css";

let currentSettings: ISettings;

// メインの処理
const init = async () => {
  const html = document.documentElement;
  html.style.display = "flex"; // display: flexを設定

  const sidebarContainer = document.createElement("div");
  sidebarContainer.id = "side-tab-root";
  html.insertBefore(sidebarContainer, html.firstChild);

  // 設定を読み込んで適用
  currentSettings = await getSettings();

  // CSSカスタムプロパティを設定
  document.documentElement.style.setProperty(
    "--sidebar-width",
    `${currentSettings.sidebarWidth}px`
  );

  const root = createRoot(sidebarContainer);
  root.render(<Sidebar settings={currentSettings} />);
};

// メッセージリスナーを設定
chrome.runtime.onMessage.addListener((message: IMessage) => {
  if (message.type === "UPDATE_SETTINGS" && message.settings) {
    currentSettings = message.settings;
    // CSSカスタムプロパティを更新
    document.documentElement.style.setProperty(
      "--sidebar-width",
      `${currentSettings.sidebarWidth}px`
    );

    // 設定の変更をイベントとして発行
    window.dispatchEvent(
      new CustomEvent("settings-updated", { detail: currentSettings })
    );
  }
});

// 初期化の実行
init();
