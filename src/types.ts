export interface Tab {
  id: number;
  title: string;
  favIconUrl?: string;
  groupId?: number;
  groupTitle?: string;
}

export interface TabGroup {
  id: string | number;
  title: string;
  tabs: Tab[];
}

export interface Message {
  type: "GET_TABS" | "UPDATE_TABS" | "ACTIVATE_TAB" | "REORDER_TABS";
  tabs?: Tab[];
  tabId?: number;
  sourceId?: number;
  targetId?: number;
}
