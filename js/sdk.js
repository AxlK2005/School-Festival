async function initApp() {
    try {
        await initSDK();
        await loadProductList();
        await loadSalesHistory();
    } catch (error) {
        console.error("Initialization failed", error);
    }
}

async function initSDK() {
    RKZ.config.appAuthUsername = '93af461084793fe02a394f7efb844716';
    RKZ.config.appAuthPassword = '7e38pBSP';
    await RKZ.init('bp.dfe961aeed90d0de45399e988ae2e069ee827bfc');
    console.log('SDK initialized successfully');
}
