import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Sidebar } from "./components/sidebar";
import { ITab, IMessage, ISettings } from "./types";
import { getSettings } from "./utils/storage";
import "./content.css";

const Content: React.FC = () => {
  const [tabs, setTabs] = useState<ITab[]>([]);
  const [settings, setSettings] = useState<ISettings | null>(null);

  const checkExcludedSite = (url: string, excludedSites: string[]): boolean => {
    const urlObj = new URL(url);
    return excludedSites.some((site) => {
      // ワイルドカードを正規表現に変換
      const pattern = site
        .replace(/\./g, "\\.")
        .replace(/\*/g, ".*")
        .replace(/^https?:\/\//, "");

      // ドメイン部分のみを比較
      return new RegExp(`^${pattern}$`).test(urlObj.hostname);
    });
  };

  useEffect(() => {
    const initialize = async () => {
      const s = await getSettings();

      // 除外サイトのチェック
      const currentUrl = window.location.href;
      if (checkExcludedSite(currentUrl, s.excludedSites)) {
        return;
      }

      setSettings(s);
      document.body.classList.toggle("dark-mode", s.darkMode);
    };

    initialize();
  }, []);

  useEffect(() => {
    const messageHandler = async (message: IMessage) => {
      if (message.type === "UPDATE_TABS") {
        setTabs(message.tabs || []);
      } else if (message.type === "UPDATE_SETTINGS") {
        if (!message.settings) return;

        // 除外サイトのチェック
        const currentUrl = window.location.href;
        if (checkExcludedSite(currentUrl, message.settings.excludedSites)) {
          const root = document.getElementById("side-tab-root");
          if (root) {
            root.remove();
          }
          return;
        }

        setSettings(message.settings);
        document.body.classList.toggle("dark-mode", message.settings.darkMode);
      }
    };

    chrome.runtime.onMessage.addListener(messageHandler);
    return () => {
      chrome.runtime.onMessage.removeListener(messageHandler);
    };
  }, []);

  if (!settings) {
    return null;
  }

  return (
    <div
      id="side-tab-root"
      style={{ width: settings.sidebarWidth, fontSize: settings.fontSize }}
    >
      <Sidebar tabs={tabs} />
    </div>
  );
};

const root = document.createElement("div");
root.id = "side-tab-root";
document.body.appendChild(root);
createRoot(root).render(<Content />);
