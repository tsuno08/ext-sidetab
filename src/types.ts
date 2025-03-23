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

export const MESSAGE_TYPE = {
  GET_TABS: "GET_TABS",
  UPDATE_TABS: "UPDATE_TABS",
  ACTIVATE_TAB: "ACTIVATE_TAB",
  REORDER_TABS: "REORDER_TABS",
} as const;

export type Message =
  | { type: typeof MESSAGE_TYPE.GET_TABS }
  | { type: typeof MESSAGE_TYPE.UPDATE_TABS; tabs: Tab[] }
  | { type: typeof MESSAGE_TYPE.ACTIVATE_TAB; tabId: number }
  | {
      type: typeof MESSAGE_TYPE.REORDER_TABS;
      sourceId: number;
      targetId: number;
    };
