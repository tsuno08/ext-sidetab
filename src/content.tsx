import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Tab, TabGroup, Message } from "./types";
import "./styles.css";

const TabElement: React.FC<{ tab: Tab }> = ({ tab }) => {
  const handleClick = () => {
    chrome.runtime.sendMessage({
      type: "ACTIVATE_TAB",
      tabId: tab.id,
    } as Message);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", tab.id.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("bg-tab-hover");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("bg-tab-hover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-tab-hover");
    const sourceTabId = parseInt(e.dataTransfer.getData("text/plain"));
    if (sourceTabId !== tab.id) {
      chrome.runtime.sendMessage({
        type: "REORDER_TABS",
        sourceId: sourceTabId,
        targetId: tab.id,
      } as Message);
    }
  };

  return (
    <div
      className="tab-item"
      draggable
      onClick={handleClick}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <img
        src={tab.favIconUrl || "images/default-icon.png"}
        alt=""
        className="tab-icon"
      />
      <span className="tab-title">{tab.title}</span>
    </div>
  );
};

const TabGroup: React.FC<{ group: TabGroup }> = ({ group }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="tab-group">
      <div
        className="group-header"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <span className="group-title">{group.title || "未分類"}</span>
        <span className="group-count">{group.tabs.length}個のタブ</span>
      </div>
      {!isCollapsed && (
        <div className="group-content">
          {group.tabs.map((tab) => (
            <TabElement key={tab.id} tab={tab} />
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    chrome.runtime.sendMessage({ type: "GET_TABS" } as Message);
  }, []);

  useEffect(() => {
    const messageListener = (message: Message) => {
      if (message.type === "UPDATE_TABS" && message.tabs) {
        setTabs(message.tabs);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, []);

  const filteredTabs = tabs.filter((tab) =>
    tab.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groups = filteredTabs.reduce<{ [key: string]: TabGroup }>(
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

  return (
    <div id="side-tab-sidebar">
      <div className="search-bar">
        <input
          type="text"
          placeholder="タブを検索..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="p-2">
        {Object.values(groups).map((group) => (
          <TabGroup key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
};

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
