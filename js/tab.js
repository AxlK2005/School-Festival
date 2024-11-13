const tabMenus = document.querySelectorAll('.tab__menu-item');
tabMenus.forEach(tabMenu => tabMenu.addEventListener('click', handleTabSwitch));

function handleTabSwitch(e) {
    const selectedTab = e.currentTarget;
    const tabTargetData = selectedTab.dataset.tab;
    const tabMenu = selectedTab.closest('.tab__menu');
    const tabItems = tabMenu.querySelectorAll('.tab__menu-item');
    const tabPanelItems = document.querySelectorAll('.tab__panel-box');

    tabItems.forEach(item => item.classList.remove('is-active'));
    tabPanelItems.forEach(panel => panel.classList.remove('is-show'));

    selectedTab.classList.add('is-active');
    const targetPanel = document.querySelector(`.tab__panel-box[data-panel="${tabTargetData}"]`);
    targetPanel.classList.add('is-show');
}
