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
          favicon:
            tab.favIconUrl || chrome.runtime.getURL("images/default-icon.png"),
          groupId: tab.groupId?.toString(),
          groupTitle: group ? group.title : "未分類",
        };
      });

      // すべてのタブにメッセージを送信
      tabs.forEach((tab) => {
        if (tab.id) {
          try {
            chrome.tabs.sendMessage(tab.id, {
              type: "UPDATE_TABS",
              tabs: tabsWithGroups,
            });
          } catch (error) {
            console.error("メッセージ送信に失敗しました", error);
          }
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
  try {
    const tabs = await chrome.tabs.query({});
    const sourceTab = tabs.find((tab) => tab.id === sourceId);
    const targetTab = tabs.find((tab) => tab.id === targetId);

    if (!sourceTab || !targetTab) return;

    // 移動先のインデックスを計算
    // ドロップ先のタブの前か後ろかを決定
    const newIndex =
      sourceTab.index < targetTab.index ? targetTab.index : targetTab.index + 1;

    // タブを移動
    await chrome.tabs.move(sourceId, { index: newIndex });

    // タブリストを更新
    sendTabsToContentScript();
  } catch (error) {
    console.error("タブの並び替えに失敗しました:", error);
  }
};

// タブの更新を処理
chrome.runtime.onMessage.addListener(
  (message: IMessage, sender, sendResponse) => {
    switch (message.type) {
      case "GET_TABS":
        chrome.tabs.query({}, async (tabs) => {
          try {
            const tabList = await Promise.all(
              tabs.map(async (tab) => {
                let groupTitle: string | undefined = undefined;
                if (tab.groupId && tab.groupId !== chrome.tabs.TAB_ID_NONE) {
                  try {
                    const group = await chrome.tabGroups.get(tab.groupId);
                    groupTitle = group.title;
                  } catch (error) {
                    console.error("タブグループの取得に失敗:", error);
                  }
                }

                return {
                  id: tab.id!,
                  title: tab.title || "",
                  url: tab.url || "",
                  favicon:
                    tab.favIconUrl ||
                    chrome.runtime.getURL("images/default-icon.png"),
                  groupId: tab.groupId?.toString(),
                  groupTitle: groupTitle || "未分類",
                };
              })
            );
            sendResponse({ type: "UPDATE_TABS", tabs: tabList });
          } catch (error) {
            console.error("タブ情報の取得に失敗:", error);
            sendResponse({ type: "UPDATE_TABS", tabs: [] });
          }
        });
        return true; // 非同期レスポンスのために必要

      case "ACTIVATE_TAB":
        if (message.tabId) {
          chrome.tabs.update(message.tabId, { active: true });
        }
        break;

      case "REORDER_TABS":
        if (message.sourceId && message.targetId) {
          reorderTabs(message.sourceId, message.targetId);
        }
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
