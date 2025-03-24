export type ITab = {
  id: number;
  title: string;
  url: string;
  favIconUrl?: string;
  groupId?: string;
  groupTitle?: string;
};

export type ITabGroup = {
  id: string;
  title: string;
  tabs: ITab[];
};

export type IMessage =
  | { type: "GET_TABS" }
  | { type: "UPDATE_TABS"; tabs: ITab[] }
  | { type: "ACTIVATE_TAB"; tabId: number }
  | {
      type: "REORDER_TABS";
      sourceId: number;
      targetId: number;
    }
  | { type: "UPDATE_SETTINGS"; settings: ISettings };

export type ISettings = {
  sidebarWidth: number;
  darkMode: boolean;
  fontSize: number;
};
