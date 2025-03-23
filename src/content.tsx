import React from "react";
import { createRoot } from "react-dom/client";
import { Sidebar } from "./components/Sidebar";
import "./styles.css";

// メインの処理
function init() {
  const html = document.documentElement;
  const sidebarContainer = document.createElement("div");
  sidebarContainer.id = "side-tab-root";
  html.insertBefore(sidebarContainer, html.firstChild);

  // メインコンテンツを右にシフト
  html.style.display = "flex";
  html.style.marginLeft = "280px";

  const root = createRoot(sidebarContainer);
  root.render(<Sidebar />);
}

// 初期化の実行
init();
