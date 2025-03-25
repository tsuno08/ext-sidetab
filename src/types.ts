export type MessageType =
  | "GET_TABS"
  | "UPDATE_TABS"
  | "ACTIVATE_TAB"
  | "REORDER_TABS"
  | "UPDATE_SETTINGS"
  | "CLOSE_TAB"
  | "NEW_TAB"
  | "DELETE_GROUP"
  | "RENAME_GROUP";

export interface ITab {
  id: number;
  title: string;
  url: string;
  favicon?: string;
  groupId?: string;
  groupTitle?: string;
}

export interface ITabGroup {
  id: string;
  title: string;
  tabs: ITab[];
}

export interface ISettings {
  sidebarWidth: number;
  darkMode: boolean;
  fontSize: number;
  excludedSites: string[];
}

export interface IMessage {
  type: MessageType;
  tabs?: ITab[];
  tabId?: number;
  groupId?: string;
  newTitle?: string;
  settings?: ISettings;
  sourceId?: number;
  targetId?: number;
}
