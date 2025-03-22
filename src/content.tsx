import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Tab, TabGroup, Message } from "./types";

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
      className="flex items-center p-2 hover:bg-tab-hover rounded cursor-pointer"
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
        className="w-4 h-4 mr-2"
      />
      <span className="flex-1 truncate">{tab.title}</span>
    </div>
  );
};

const TabGroup: React.FC<{ group: TabGroup }> = ({ group }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="mb-2">
      <div
        className="flex items-center justify-between p-2 bg-group-header rounded-t cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <span className="font-medium">{group.title || "未分類"}</span>
        <span className="text-sm text-gray-500">
          {group.tabs.length}個のタブ
        </span>
      </div>
      {!isCollapsed && (
        <div className="pl-4">
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
    <div className="fixed left-0 top-0 w-sidebar h-screen bg-sidebar-bg border-r border-sidebar-border overflow-y-auto z-50">
      <div className="p-4 border-b border-sidebar-border">
        <input
          type="text"
          placeholder="タブを検索..."
          className="w-full px-3 py-2 border border-sidebar-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
