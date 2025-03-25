import React, { useEffect, useState } from "react";
import { SearchBar } from "./search-bar";
import { TabGroup } from "./tab-group";
import { ITab, ITabGroup, IMessage, ISettings } from "../types";
import { getSettings } from "../utils/storage";

interface ISidebarProps {
  tabs: ITab[];
}

export const Sidebar: React.FC<ISidebarProps> = ({ tabs: initialTabs }) => {
  const [tabs, setTabs] = useState<ITab[]>(initialTabs);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [settings, setSettings] = useState<ISettings | null>(null);

  useEffect(() => {
    const initialize = async () => {
      const s = await getSettings();
      setSettings(s);
      document.body.classList.toggle("dark-mode", s.darkMode);
    };
    initialize();
  }, []);

  useEffect(() => {
    const messageListener = (message: IMessage) => {
      if (message.type === "UPDATE_TABS" && message.tabs) {
        setTabs(message.tabs);
      } else if (message.type === "UPDATE_SETTINGS" && message.settings) {
        setSettings(message.settings);
        document.body.classList.toggle("dark-mode", message.settings.darkMode);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, []);

  useEffect(() => {
    if (!settings) return;

    // サイドバーの状態が変更されたときにページのマージンを調整
    const html = document.documentElement;
    html.style.marginLeft = isCollapsed ? "48px" : `${settings.sidebarWidth}px`;
  }, [isCollapsed, settings]);

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

  if (!settings) {
    return null;
  }

  return (
    <div
      id="side-tab-sidebar"
      className={`${isCollapsed ? "collapsed" : ""} ${
        settings.darkMode ? "dark-mode" : ""
      }`}
      style={{ fontSize: `${settings.fontSize}px` }}
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
