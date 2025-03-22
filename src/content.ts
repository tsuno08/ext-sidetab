import { Tab, TabGroup, Message } from "./types";

// タブグループの作成
function createTabGroup(group: TabGroup): HTMLElement {
  const groupElement = document.createElement("div");
  groupElement.className = "mb-2";

  // グループヘッダー
  const header = document.createElement("div");
  header.className =
    "flex items-center justify-between p-2 bg-group-header rounded-t cursor-pointer";

  const title = document.createElement("span");
  title.className = "font-medium";
  title.textContent = group.title || "未分類";

  const count = document.createElement("span");
  count.className = "text-sm text-gray-500";
  count.textContent = `${group.tabs.length}個のタブ`;

  header.appendChild(title);
  header.appendChild(count);

  // グループの内容
  const content = document.createElement("div");
  content.className = "pl-4";

  // タブの表示
  group.tabs.forEach((tab) => {
    const tabElement = createTabElement(tab);
    content.appendChild(tabElement);
  });

  // 折りたたみ/展開の処理
  header.addEventListener("click", () => {
    content.classList.toggle("hidden");
  });

  groupElement.appendChild(header);
  groupElement.appendChild(content);
  return groupElement;
}

// タブ要素の作成
function createTabElement(tab: Tab): HTMLElement {
  const tabElement = document.createElement("div");
  tabElement.className =
    "flex items-center p-2 hover:bg-tab-hover rounded cursor-pointer";
  tabElement.draggable = true;

  // タブアイコン
  const icon = document.createElement("img");
  icon.src = tab.favIconUrl || "images/default-icon.png";
  icon.className = "w-4 h-4 mr-2";

  // タブタイトル
  const title = document.createElement("span");
  title.className = "flex-1 truncate";
  title.textContent = tab.title;

  tabElement.appendChild(icon);
  tabElement.appendChild(title);

  // クリックでタブをアクティブに
  tabElement.addEventListener("click", () => {
    chrome.runtime.sendMessage({
      type: "ACTIVATE_TAB",
      tabId: tab.id,
    } as Message);
  });

  // ドラッグ&ドロップの処理
  tabElement.addEventListener("dragstart", (e: DragEvent) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData("text/plain", tab.id.toString());
    }
  });

  tabElement.addEventListener("dragover", (e: DragEvent) => {
    e.preventDefault();
    tabElement.classList.add("bg-tab-hover");
  });

  tabElement.addEventListener("dragleave", () => {
    tabElement.classList.remove("bg-tab-hover");
  });

  tabElement.addEventListener("drop", (e: DragEvent) => {
    e.preventDefault();
    tabElement.classList.remove("bg-tab-hover");
    if (e.dataTransfer) {
      const sourceTabId = parseInt(e.dataTransfer.getData("text/plain"));
      if (sourceTabId !== tab.id) {
        reorderTabs(sourceTabId, tab.id);
      }
    }
  });

  return tabElement;
}

// タブの並び替え
function reorderTabs(sourceId: number, targetId: number): void {
  chrome.runtime.sendMessage({
    type: "REORDER_TABS",
    sourceId,
    targetId,
  } as Message);
}

// タブのフィルタリング
function filterTabs(query: string): void {
  const tabList = document.getElementById("tab-list");
  if (!tabList) return;

  const groups = tabList.children;

  Array.from(groups).forEach((group) => {
    const tabs = group.querySelectorAll('div[class*="hover:bg-tab-hover"]');
    let hasVisibleTabs = false;

    tabs.forEach((tab) => {
      const title = tab.querySelector("span")?.textContent?.toLowerCase() || "";
      const isVisible = title.includes(query.toLowerCase());
      (tab as HTMLElement).style.display = isVisible ? "flex" : "none";
      if (isVisible) hasVisibleTabs = true;
    });

    (group as HTMLElement).style.display = hasVisibleTabs ? "block" : "none";
  });
}

// タブリストの更新
function updateTabList(tabs: Tab[]): void {
  const tabList = document.getElementById("tab-list");
  if (!tabList) return;

  tabList.innerHTML = "";

  // タブをグループ化
  const groups: { [key: string]: TabGroup } = {};
  tabs.forEach((tab) => {
    const groupId = tab.groupId || "default";
    if (!groups[groupId]) {
      groups[groupId] = {
        id: groupId,
        title: tab.groupTitle || "未分類",
        tabs: [],
      };
    }
    groups[groupId].tabs.push(tab);
  });

  // グループを表示
  Object.values(groups).forEach((group) => {
    const groupElement = createTabGroup(group);
    tabList.appendChild(groupElement);
  });
}

// サイドバーの作成
function createSidebar(): HTMLElement {
  const sidebar = document.createElement("div");
  sidebar.id = "side-tab-sidebar";
  sidebar.className =
    "fixed left-0 top-0 w-sidebar h-screen bg-sidebar-bg border-r border-sidebar-border overflow-y-auto z-50";

  // 検索バー
  const searchBar = document.createElement("div");
  searchBar.className = "p-4 border-b border-sidebar-border";
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "タブを検索...";
  searchInput.className =
    "w-full px-3 py-2 border border-sidebar-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";
  searchInput.addEventListener("input", (e: Event) => {
    const target = e.target as HTMLInputElement;
    filterTabs(target.value);
  });
  searchBar.appendChild(searchInput);
  sidebar.appendChild(searchBar);

  // タブリスト
  const tabList = document.createElement("div");
  tabList.id = "tab-list";
  tabList.className = "p-2";
  sidebar.appendChild(tabList);

  return sidebar;
}

// メインの処理
function init(): void {
  const html = document.documentElement;
  const sidebar = createSidebar();

  // サイドバーを追加
  html.insertBefore(sidebar, html.firstChild);

  // メインコンテンツを右にシフト
  html.style.display = "flex";
  html.style.marginLeft = "280px";

  // タブ情報を取得
  chrome.runtime.sendMessage({ type: "GET_TABS" } as Message);
}

// メッセージリスナー
chrome.runtime.onMessage.addListener((message: Message, _sender, _) => {
  if (message.type === "UPDATE_TABS" && message.tabs) {
    updateTabList(message.tabs);
  }
});

// 初期化の実行
init();
