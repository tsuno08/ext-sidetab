import React, { useEffect, useState } from "react";
import { SearchBar } from "./search-bar";
import { TabGroup } from "./tab-group";
import { ITab, ITabGroup, IMessage } from "../types";

export const Sidebar: React.FC = () => {
  const [tabs, setTabs] = useState<ITab[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <div id="side-tab-sidebar">
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <div className="tab-list">
        {Object.values(groups).map((group) => (
          <TabGroup key={group.id} group={group} />
        ))}
        <button className="new-tab-button" onClick={handleNewTab}>
          + 新規タブ
        </button>
      </div>
    </div>
  );
};
