import React, { useEffect, useState } from "react";
import { ITab, ITabGroup, IMessage } from "../types";
import { SearchBar } from "./SearchBar";
import { TabGroup as TabGroupComponent } from "./TabGroup";

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

  return (
    <div id="side-tab-sidebar">
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      {Object.values(groups).map((group) => (
        <TabGroupComponent key={group.id} group={group} />
      ))}
    </div>
  );
};
