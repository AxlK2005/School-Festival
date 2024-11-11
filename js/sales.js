document.addEventListener("DOMContentLoaded", async () => {
    await initSDK();
    await loadSalesHistory();
});

async function loadSalesHistory() {
    try {
        const salesData = await RKZ.Data.query('sales').asc('timestamp').find();
        renderSalesHistory(salesData.data);
    } catch (error) {
        console.error("販売履歴の取得に失敗しました", error);
    }
}

function renderSalesHistory(salesData) {
    const salesHistory = document.getElementById("sales-history");
    const overallSales = document.getElementById("overall-sales");
    salesHistory.innerHTML = '';

    let totalSalesAmount = 0;
    salesData.forEach(sale => {
        salesHistory.appendChild(createSaleEntry(sale));
        totalSalesAmount += parseFloat(sale.attributes.total);
    });

    overallSales.innerHTML = `<h3>全体の売上合計: ¥${totalSalesAmount}</h3>`;
}

function createSaleEntry(sale) {
    const saleElement = document.createElement("div");
    saleElement.classList.add("sale-entry");

    const items = JSON.parse(sale.attributes.items);
    const itemsDetails = formatItemDetails(items);

    saleElement.innerHTML = `
        <p>${new Date(sale.attributes.timestamp).toLocaleString()}</p>
        <p>${itemsDetails}</p>
        <p>合計: ¥${sale.attributes.total}</p>
    `;
    return saleElement;
}

function formatItemDetails(items) {
    return items.map(({ name, price, quantity }) => `${name} - ¥${price} x ${quantity}`).join('<br>');
}