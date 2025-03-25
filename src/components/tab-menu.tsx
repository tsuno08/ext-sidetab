import React, { useEffect, useRef } from "react";
import { ITab } from "../types";

type ITabMenuProps = {
  tab: ITab;
  onClose: () => void;
  position: { x: number; y: number };
};

export const TabMenu: React.FC<ITabMenuProps> = ({
  tab,
  onClose,
  position,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleCloseTab = () => {
    chrome.runtime.sendMessage({
      type: "CLOSE_TAB",
      tabId: tab.id,
    });
    onClose();
  };

  const handleNewTab = () => {
    chrome.runtime.sendMessage({
      type: "NEW_TAB",
    });
    onClose();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(tab.url);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="tab-menu"
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 1000,
      }}
    >
      <button className="tab-menu-item" onClick={handleCloseTab}>
        タブを閉じる
      </button>
      <button className="tab-menu-item" onClick={handleNewTab}>
        新規タブ
      </button>
      <button className="tab-menu-item" onClick={handleCopyLink}>
        リンクをコピー
      </button>
    </div>
  );
};
