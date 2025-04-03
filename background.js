let refresherActive = false;
let intervalId = null;
let currentTabIndex = 0;
let tabsArray = [];
let shouldRefresh = true; // Padrão: ativado
let switchDelay = 3500; // Valor padrão caso não seja definido

// Recupera o estado salvo do refresh ao iniciar
chrome.storage.local.get(["refresh"], (data) => {
    shouldRefresh = data.refresh ?? true; // Se não houver valor salvo, assume true
});

function refreshTabs(refreshInterval) {
    if (tabsArray.length === 0) return;

    const tab = tabsArray[currentTabIndex];

    if (shouldRefresh) {
        chrome.tabs.reload(tab.id, () => {
            setTimeout(() => {
                switchTab();
            }, switchDelay);
        });
    } else {
        setTimeout(() => {
            switchTab();
        }, switchDelay);
    }
}

function switchTab() {
    if (tabsArray.length === 0) return;

    currentTabIndex = (currentTabIndex + 1) % tabsArray.length;
    chrome.tabs.update(tabsArray[currentTabIndex].id, { active: true });
}

function startRefresher(refreshInterval, delay, refresh) {
    if (!refresherActive) {
        refresherActive = true;
        shouldRefresh = refresh;
        switchDelay = delay;

        chrome.tabs.query({ currentWindow: true }, (tabs) => {
            tabsArray = tabs;
            currentTabIndex = tabsArray.findIndex(tab => tab.active);

            intervalId = setInterval(() => refreshTabs(refreshInterval), refreshInterval);
        });
    }
}

function stopRefresher() {
    refresherActive = false;
    clearInterval(intervalId);
    intervalId = null;
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "start") {
        startRefresher(message.switchInterval, message.switchDelay, message.refresh);
    } else if (message.action === "stop") {
        stopRefresher();
    } else if (message.action === "toggleRefresh") {
        shouldRefresh = message.enabled;
        chrome.storage.local.set({ refresh: shouldRefresh });
    }
});
