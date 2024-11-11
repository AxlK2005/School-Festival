
const tabMenus = document.querySelectorAll('.tab__menu-item');
tabMenus.forEach(tabMenu => tabMenu.addEventListener('click', handleTabSwitch));

function handleTabSwitch(e) {
    const selectedTab = e.currentTarget;
    const tabTargetData = selectedTab.dataset.tab;
    const tabMenu = selectedTab.closest('.tab__menu');
    const tabItems = tabMenu.querySelectorAll('.tab__menu-item');
    const tabPanelItems = tabMenu.nextElementSibling.querySelectorAll('.tab__panel-box');

    switchTabsAndPanels(tabItems, tabPanelItems, selectedTab, tabTargetData);
}

function switchTabsAndPanels(tabItems, tabPanelItems, selectedTab, tabTargetData) {
    deactivateTabs(tabItems, tabPanelItems);
    activateTabAndPanel(selectedTab, tabTargetData, tabPanelItems);
}

function deactivateTabs(tabItems, tabPanelItems) {
    tabItems.forEach(tabItem => tabItem.classList.remove('is-active'));
    tabPanelItems.forEach(tabPanelItem => tabPanelItem.classList.remove('is-show'));
}

function activateTabAndPanel(selectedTab, tabTargetData, tabPanelItems) {
    selectedTab.classList.add('is-active');
    tabPanelItems.forEach(tabPanelItem => {
        if (tabPanelItem.dataset.panel === tabTargetData) {
            tabPanelItem.classList.add('is-show');
        }
    });
}

