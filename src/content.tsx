import React from "react";
import { createRoot } from "react-dom/client";
import { Sidebar } from "./components/content/sidebar";
import "./content.css";
import { IMessage, ISettings } from "./types";
import { getSettings } from "./utils/storage";

// メインの処理
const init = async () => {
  const html = document.documentElement;
  html.style.display = "flex"; // display: flexを設定

  const sidebarContainer = document.createElement("div");
  sidebarContainer.id = "side-tab-root";
  html.insertBefore(sidebarContainer, html.firstChild);

  const root = createRoot(sidebarContainer);
  root.render(<Sidebar />);

  // 設定を読み込んで適用
  const settings = await getSettings();
  applySettings(settings);
}

// 設定を適用する関数
const applySettings = (settings: ISettings) => {
  const html = document.documentElement;
  const div = document.getElementById("side-tab-sidebar");
  if (div) {
    div.style.width = `${settings.sidebarWidth}px`;
  }
  html.style.marginLeft = `${settings.sidebarWidth}px`;
  html.style.fontSize = `${settings.fontSize}px`;
  html.classList.toggle("dark-mode", settings.darkMode);
}

// メッセージリスナーを設定
chrome.runtime.onMessage.addListener((message: IMessage) => {
  if (message.type === "UPDATE_SETTINGS") {
    applySettings(message.settings);
  }
});

// 初期化の実行
init();
