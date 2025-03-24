import { IMessage } from "./types";

// タブ情報を取得してcontent.jsに送信
const sendTabsToContentScript = (): void => {
  chrome.tabs.query({}, (tabs) => {
    // タブグループ情報を取得
    chrome.tabGroups.query({}, (groups) => {
      // タブにグループ情報を追加
      const tabsWithGroups = tabs.map((tab) => {
        const group = groups.find((g) => g.id === tab.groupId);
        return {
          id: tab.id!,
          title: tab.title!,
          url: tab.url!,
          favIconUrl: tab.favIconUrl,
          groupId: tab.groupId?.toString(),
          groupTitle: group ? group.title : "未分類",
        };
      });

      // すべてのタブにメッセージを送信
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs
            .sendMessage(tab.id, {
              type: "UPDATE_TABS",
              tabs: tabsWithGroups,
            })
            .catch(() => {
              // メッセージ送信に失敗した場合は無視
              // （content scriptが読み込まれていないタブなど）
            });
        }
      });
    });
  });
};

// タブの並び替え
const reorderTabs = async (
  sourceId: number,
  targetId: number
): Promise<void> => {
  const tabs = await chrome.tabs.query({});
  const sourceIndex = tabs.findIndex((tab) => tab.id === sourceId);
  const targetIndex = tabs.findIndex((tab) => tab.id === targetId);

  if (sourceIndex === -1 || targetIndex === -1) return;

  // タブを移動
  await chrome.tabs.move(sourceId, {
    index: targetIndex,
  });

  // タブリストを更新
  sendTabsToContentScript();
};

// タブの更新を処理
chrome.runtime.onMessage.addListener(
  (message: IMessage, sender, sendResponse) => {
    switch (message.type) {
      case "GET_TABS":
        chrome.tabs.query({}, (tabs) => {
          const tabList = tabs.map((tab) => ({
            id: tab.id!,
            title: tab.title || "",
            url: tab.url || "",
            favicon: tab.favIconUrl,
            groupId: tab.groupId?.toString(),
            groupTitle: tab.groupId
              ? chrome.tabGroups.get(tab.groupId).then((group) => group.title)
              : undefined,
          }));
          sendResponse({ type: "UPDATE_TABS", tabs: tabList });
        });
        break;

      case "ACTIVATE_TAB":
        if (message.tabId) {
          chrome.tabs.update(message.tabId, { active: true });
        }
        break;

      case "REORDER_TABS":
        chrome.tabs.move(message.sourceId, { index: message.targetId });
        break;

      case "CLOSE_TAB":
        if (message.tabId) {
          chrome.tabs.remove(message.tabId);
        }
        break;

      case "NEW_TAB":
        chrome.tabs.create({}, (tab) => {
          if (message.groupId) {
            chrome.tabs.group({
              groupId: parseInt(message.groupId),
              tabIds: tab.id!,
            });
          }
        });
        break;

      case "UPDATE_SETTINGS":
        chrome.storage.sync.set({ settings: message.settings });
        break;

      case "DELETE_GROUP":
        if (message.groupId) {
          chrome.tabs.query({ groupId: parseInt(message.groupId) }, (tabs) => {
            tabs.forEach((tab) => {
              if (tab.id) {
                chrome.tabs.group({
                  groupId: chrome.tabs.TAB_ID_NONE,
                  tabIds: tab.id,
                });
              }
            });
          });
        }
        break;

      case "RENAME_GROUP":
        if (message.groupId && message.newTitle) {
          const groupId = parseInt(message.groupId);
          if (!isNaN(groupId)) {
            chrome.tabGroups.update(groupId, {
              title: message.newTitle,
            });
          }
        }
        break;
    }
    return true;
  }
);

// タブが更新されたときに通知
chrome.tabs.onUpdated.addListener(() => {
  sendTabsToContentScript();
});

// タブが閉じられたときに通知
chrome.tabs.onRemoved.addListener(() => {
  sendTabsToContentScript();
});

// タブグループが更新されたときに通知
chrome.tabGroups.onUpdated.addListener(() => {
  sendTabsToContentScript();
});

// タブグループが削除されたときに通知
chrome.tabGroups.onRemoved.addListener(() => {
  sendTabsToContentScript();
});
