import React from "react";
import { Tab, Message } from "../types";

type TabElementProps = {
  tab: Tab;
};

export const TabElement: React.FC<TabElementProps> = ({ tab }) => {
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
