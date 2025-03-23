export type Tab = {
  id: number;
  title: string;
  url: string;
  favIconUrl?: string;
  groupId?: string;
  groupTitle?: string;
};

export type TabGroup = {
  id: string;
  title: string;
  tabs: Tab[];
};

export type Message =
  | { type: "GET_TABS" }
  | { type: "UPDATE_TABS"; tabs: Tab[] }
  | { type: "ACTIVATE_TAB"; tabId: number }
  | { type: "REORDER_TABS"; sourceId: number; targetId: number };
