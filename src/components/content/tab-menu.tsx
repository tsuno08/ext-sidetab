import React from "react";
import { ITab } from "../../types";

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
      className="tab-menu"
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 1000,
      }}
    >
      <button className="menu-item" onClick={handleCloseTab}>
        タブを閉じる
      </button>
      <button className="menu-item" onClick={handleNewTab}>
        新規タブ
      </button>
      <button className="menu-item" onClick={handleCopyLink}>
        リンクをコピー
      </button>
    </div>
  );
};
