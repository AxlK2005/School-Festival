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
    const salesTable = document.getElementById("sales-table").getElementsByTagName('tbody')[0];
    const overallSales = document.getElementById("overall-sales").querySelector("p");

    salesTable.innerHTML = '';
    let totalSalesAmount = 0;

    salesData.forEach(sale => {
        const saleRow = createSaleEntry(sale);
        salesTable.appendChild(saleRow);
        totalSalesAmount += parseFloat(sale.attributes.total);
    });

    overallSales.innerHTML = `全体の売上合計: ¥${totalSalesAmount.toLocaleString()}`;
}

function createSaleEntry(sale) {
    const row = document.createElement("tr");
    const items = JSON.parse(sale.attributes.items);
    const itemsDetails = formatItemDetails(items);

    row.innerHTML = `
        <td>${new Date(sale.attributes.timestamp).toLocaleString()}</td>
        <td>${itemsDetails}</td>
        <td>¥${sale.attributes.total}</td>
    `;
    return row;
}

function formatItemDetails(items) {
    return items.map(({ name, price, quantity }) => `${name} - ¥${price} x ${quantity}`).join(', ');
}
