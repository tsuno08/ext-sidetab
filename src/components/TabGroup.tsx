import React, { useState } from "react";
import { TabGroup as TabGroupType } from "../types";
import { TabElement } from "./TabElement";

type TabGroupProps = {
  group: TabGroupType;
};

export const TabGroup: React.FC<TabGroupProps> = ({ group }) => {
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
