import React, { useState } from "react";
import { ITab, IMessage } from "../types";
import { TabMenu } from "./tab-menu";

type ITabElementProps = {
  tab: ITab;
};

export const TabElement: React.FC<ITabElementProps> = ({ tab }) => {
  const [menuPosition, setMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (e.button === 0) {
      // 左クリック
      chrome.runtime.sendMessage({
        type: "ACTIVATE_TAB",
        tabId: tab.id,
      } as IMessage);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMenuClose = () => {
    setMenuPosition(null);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", tab.id.toString());
    setIsDragging(true);
    e.currentTarget.classList.add("dragging");
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    e.currentTarget.classList.remove("dragging");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragging) {
      e.currentTarget.classList.add("bg-tab-hover");
    }
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
      } as IMessage);
    }
  };

  return (
    <>
      <div
        className="tab-item"
        draggable
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <img src={tab.favicon} alt="" className="tab-icon" />
        <span className="tab-title">{tab.title}</span>
      </div>
      {menuPosition && (
        <TabMenu tab={tab} position={menuPosition} onClose={handleMenuClose} />
      )}
    </>
  );
};
