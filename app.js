document.addEventListener("DOMContentLoaded", initApp);

// Application Initialization
async function initApp() {
    try {
        await initSDK();
        renderHeader();
        await loadProductList();
        await loadSalesHistory();
    } catch (error) {
        console.error("Initialization failed", error);
    }
}

// Initialize SDK
async function initSDK() {
    RKZ.config.appAuthUsername = '93af461084793fe02a394f7efb844716';
    RKZ.config.appAuthPassword = '7e38pBSP';
    await RKZ.init('bp.dfe961aeed90d0de45399e988ae2e069ee827bfc');
    console.log('SDK initialized successfully');
}

// Render Header
function renderHeader() {
    const header = document.querySelector("header");
    header.innerHTML = `
        <h1>学園祭アプリ</h1>
        <nav aria-label="Page navigation">
            <ul>
                <li><a href="index.html">ホーム</a></li>
                <li><a href="cashier.html">レジ</a></li>
                <li><a href="register.html">商品登録</a></li>
                <li><a href="sales.html">販売履歴</a></li>
            </ul>
        </nav>
    `;
}

// Product Registration
async function registerProduct() {
    const name = document.getElementById("productName").value.trim();
    const price = parseFloat(document.getElementById("productPrice").value);
    const quantity = parseInt(document.getElementById("productQuantity").value);

    if (!validateProductInput(name, price, quantity)) {
        alert("すべての項目を正しく入力してください");
        return;
    }

    try {
        await RKZ.Data.add({
            object_id: 'product',
            name,
            attributes: { price, quantity }
        });
        alert("商品を登録しました！");
        document.getElementById("register-form").reset();
        await loadProductList();
    } catch (error) {
        console.error("商品登録に失敗しました", error);
        alert("商品登録に失敗しました。");
    }
}

// Validate Product Input
function validateProductInput(name, price, quantity) {
    return name && !isNaN(price) && price > 0 && !isNaN(quantity) && quantity > 0;
}

// Load Products
async function loadProductList() {
    try {
        const products = await RKZ.Data.query('product').find();
        renderProductList(products.data);
    } catch (error) {
        console.error("商品情報の取得に失敗しました", error);
    }
}

// Render Product List
function renderProductList(products) {
    const productList = document.getElementById("product-list");
    productList.innerHTML = '';

    products.forEach(product => {
        const productElement = document.createElement("div");
        productElement.classList.add("product-item");
        productElement.innerHTML = `
            <span>${product.name} - ¥${product.attributes.price}</span>
            <button class="add-to-cart-btn" onclick="addToCart('${product.code}', '${product.name}', ${product.attributes.price})">追加</button>
        `;
        productList.appendChild(productElement);
    });
}

// Cart Management
let cart = [];

function addToCart(productId, productName, price) {
    cart.push({ id: productId, name: productName, price });
    alert(`${productName} をカートに追加しました`);
}

// Format Date
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Checkout Process
async function checkout() {
    const total = cart.reduce((sum, item) => sum + item.price, 0);

    if (total === 0) {
        alert("カートに商品がありません");
        return;
    }

    try {
        const formattedItems = JSON.stringify(cart.map(item => ({ name: item.name, price: item.price })));

        await RKZ.Data.add({
            object_id: 'sales',
            name: "会計データ",
            attributes: {
                items: formattedItems,
                total,
                timestamp: formatDate(new Date()),
            }
        });
        alert(`会計が完了しました！合計: ¥${total}`);
        cart = [];
        await loadProductList();
    } catch (error) {
        console.error("会計に失敗しました", error);
        alert("会計に失敗しました。再試行してください。");
    }
}

// Load Sales History
async function loadSalesHistory() {
    try {
        const dataResult = await RKZ.Data.query('sales').asc('timestamp').find();
        renderSalesHistory(dataResult.data);
    } catch (error) {
        console.error("販売履歴の取得に失敗しました", error);
    }
}

// Render Sales History
function renderSalesHistory(salesData) {
    const salesHistory = document.getElementById("sales-history");
    salesHistory.innerHTML = '';

    salesData.forEach(sale => {
        const saleElement = document.createElement("div");
        saleElement.classList.add("sale-entry");

        const items = JSON.parse(sale.attributes.items);
        const itemsDetails = getItemDetails(items);

        saleElement.innerHTML = `
            <p>${new Date(sale.attributes.timestamp).toLocaleString()}</p>
            <p>${itemsDetails}</p>
            <p>合計: ¥${sale.attributes.total}</p>
        `;
        salesHistory.appendChild(saleElement);
    });
}

function getItemDetails(items) {
    const itemCounts = items.reduce((acc, item) => {
        if (acc[item.name]) {
            acc[item.name].count += 1;
        } else {
            acc[item.name] = { price: item.price, count: 1 };
        }
        return acc;
    }, {});

    return Object.entries(itemCounts)
        .map(([name, { price, count }]) => `${name} - ¥${price} x ${count}`)
        .join('<br>');
}
