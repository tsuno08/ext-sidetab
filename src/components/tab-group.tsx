import React, { useState, useRef, useEffect } from "react";
import { TabElement } from "./tab-element";
import { ITabGroup, IMessage } from "../types";

type ITabGroupProps = {
  group: ITabGroup;
};

export const TabGroup: React.FC<ITabGroupProps> = ({ group }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const groupRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        groupRef.current &&
        !groupRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setShowMenu(true);
  };

  const handleDeleteGroup = async () => {
    const message: IMessage = {
      type: "DELETE_GROUP",
      groupId: group.id,
    };
    await chrome.runtime.sendMessage(message);
    setShowMenu(false);
  };

  const handleRenameGroup = async () => {
    const newTitle = prompt("新しいグループ名を入力してください", group.title);
    if (newTitle) {
      const message: IMessage = {
        type: "RENAME_GROUP",
        groupId: group.id,
        newTitle,
      };
      await chrome.runtime.sendMessage(message);
    }
    setShowMenu(false);
  };

  const handleAddTab = async () => {
    const message: IMessage = {
      type: "NEW_TAB",
      groupId: group.id,
    };
    await chrome.runtime.sendMessage(message);
    setShowMenu(false);
  };

  return (
    <div className="tab-group" ref={groupRef}>
      <div
        className="group-header"
        onClick={() => setIsCollapsed(!isCollapsed)}
        onContextMenu={handleContextMenu}
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
      {showMenu && (
        <div
          ref={menuRef}
          className="group-menu"
          style={{
            position: "fixed",
            left: menuPosition.x,
            top: menuPosition.y,
          }}
        >
          <button className="menu-item" onClick={handleRenameGroup}>
            グループ名を変更
          </button>
          <button className="menu-item" onClick={handleAddTab}>
            タブを追加
          </button>
          <button className="menu-item" onClick={handleDeleteGroup}>
            グループを削除
          </button>
        </div>
      )}
    </div>
  );
};
