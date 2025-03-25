import React, { useEffect, useState } from "react";
import { SearchBar } from "./search-bar";
import { TabGroup } from "./tab-group";
import { ITab, ITabGroup, IMessage, ISettings } from "../types";

interface ISidebarProps {
  settings: ISettings;
}

export const Sidebar: React.FC<ISidebarProps> = ({ settings }) => {
  const [tabs, setTabs] = useState<ITab[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentSettings, setCurrentSettings] = useState(settings);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: "GET_TABS" });
    const messageListener = (message: IMessage) => {
      if (message.type === "UPDATE_TABS" && message.tabs) {
        setTabs(message.tabs);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, []);

  useEffect(() => {
    // 設定の更新を監視
    const handleSettingsUpdate = (event: CustomEvent<ISettings>) => {
      setCurrentSettings(event.detail);
    };

    window.addEventListener(
      "settings-updated",
      handleSettingsUpdate as EventListener
    );
    return () => {
      window.removeEventListener(
        "settings-updated",
        handleSettingsUpdate as EventListener
      );
    };
  }, []);

  useEffect(() => {
    // サイドバーの状態が変更されたときにページのマージンを調整
    const html = document.documentElement;
    html.style.marginLeft = isCollapsed
      ? "48px"
      : `${currentSettings.sidebarWidth}px`;
  }, [isCollapsed, currentSettings.sidebarWidth]);

  const filteredTabs = tabs.filter((tab) =>
    tab.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groups = filteredTabs.reduce<{ [key: string]: ITabGroup }>(
    (acc, tab) => {
      const groupId = tab.groupId || "default";
      if (!acc[groupId]) {
        acc[groupId] = {
          id: groupId,
          title: tab.groupTitle || "未分類",
          tabs: [],
        };
      }
      acc[groupId].tabs.push(tab);
      return acc;
    },
    {}
  );

  const handleNewTab = async () => {
    const message: IMessage = {
      type: "NEW_TAB",
    };
    await chrome.runtime.sendMessage(message);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      id="side-tab-sidebar"
      className={`${isCollapsed ? "collapsed" : ""} ${
        currentSettings.darkMode ? "dark-mode" : ""
      }`}
      style={{ fontSize: `${currentSettings.fontSize}px` }}
    >
      <div className="sidebar-header">
        {!isCollapsed && (
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        )}
        <button
          className="collapse-button"
          onClick={toggleCollapse}
          title={isCollapsed ? "サイドバーを展開" : "サイドバーを折りたたむ"}
        >
          {isCollapsed ? "》" : "《"}
        </button>
      </div>
      <div className="tab-list">
        {!isCollapsed ? (
          Object.values(groups).map((group) => (
            <TabGroup key={group.id} group={group} />
          ))
        ) : (
          <div className="mini-tabs">
            {filteredTabs.map((tab) => (
              <div
                key={tab.id}
                className="mini-tab"
                onClick={() => {
                  chrome.runtime.sendMessage({
                    type: "ACTIVATE_TAB",
                    tabId: tab.id,
                  });
                }}
                title={tab.title}
              >
                <img src={tab.favicon} alt="" className="mini-tab-icon" />
              </div>
            ))}
          </div>
        )}
      </div>
      <button
        className="new-tab-button"
        onClick={handleNewTab}
        title={isCollapsed ? "新規タブ" : undefined}
      >
        {isCollapsed ? "+" : "+ 新規タブ"}
      </button>
    </div>
  );
};
