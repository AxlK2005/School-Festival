document.addEventListener("DOMContentLoaded", initApp);

// Application Initialization
async function initApp() {
    try {
        await initSDK();
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

// Product Registration
async function registerProduct() {
    const { name, price, quantity } = getProductInput();

    if (!validateProductInput(name, price, quantity)) {
        alert("すべての項目を正しく入力してください");
        return;
    }

    try {
        await addProductToDatabase(name, price, quantity);
        alert("商品を登録しました！");
        document.getElementById("register-form").reset();
        await loadProductList();
    } catch (error) {
        console.error("商品登録に失敗しました", error);
        alert("商品登録に失敗しました。");
    }
}

function getProductInput() {
    return {
        name: document.getElementById("productName").value.trim(),
        price: parseFloat(document.getElementById("productPrice").value),
        quantity: parseInt(document.getElementById("productQuantity").value)
    };
}

// Validate Product Input
function validateProductInput(name, price, quantity) {
    return name && !isNaN(price) && price > 0 && !isNaN(quantity) && quantity > 0;
}

async function addProductToDatabase(name, price, quantity) {
    await RKZ.Data.add({
        object_id: 'product',
        name,
        attributes: { price, quantity }
    });
}

// Load and Render Products
async function loadProductList() {
    try {
        const products = await RKZ.Data.query('product').find();
        renderProductList(products.data);
    } catch (error) {
        console.error("商品情報の取得に失敗しました", error);
    }
}

function renderProductList(products) {
    const productList = document.getElementById("product-list");
    productList.innerHTML = '';
    const fragment = document.createDocumentFragment();

    products.forEach(product => {
        const productElement = document.createElement("div");
        productElement.classList.add("product-item");

        productElement.innerHTML = `
            <span>${product.name} - ¥${product.attributes.price}</span>
        `;

        productElement.addEventListener("click", () => {
            addToCart(product.code, product.name, product.attributes.price, 1);
        });

        fragment.appendChild(productElement);
    });
    productList.appendChild(fragment);
}

// Cart Management
let cart = [];

function addToCart(productId, productName, price, quantity = 1) {
    addItemToCart(productId, productName, price, quantity);
    renderCart();
}

function getQuantityInput(productId) {
    return parseInt(document.getElementById(`quantity-${productId}`).value);
}

function addItemToCart(productId, productName, price, quantity) {
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id: productId, name: productName, price, quantity });
    }
}

// Remove Item from Cart
function removeFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex !== -1) {
        cart.splice(itemIndex, 1);
        alert("商品がカートから削除されました");
        renderCart();
        renderCartTotal();
    } else {
        alert("カートにその商品が見つかりません");
    }
}

// Render Cart
function renderCart() {
    const cartSection = document.getElementById("cart");
    cartSection.innerHTML = cart.length === 0 ? '<p>カートは空です</p>' : formatCartItems();
    renderCartTotal();
}

// Format Cart Items
function formatCartItems() {
    return cart
        .map(item => `
            <p>
                ${item.name} - ¥${item.price} x ${item.quantity} 
                <button onclick="removeFromCart('${item.id}')">削除</button>
            </p>
        `)
        .join('');
}

// Calculate and Display Cart Total
function renderCartTotal() {
    const total = calculateTotal();
    const cartTotalSection = document.getElementById("cart-total");

    if (!cartTotalSection) {
        const newTotalSection = document.createElement("div");
        newTotalSection.id = "cart-total";
        newTotalSection.innerHTML = `<p>合計: ¥${total}</p>`;
        document.querySelector("main").appendChild(newTotalSection);
    } else {
        cartTotalSection.innerHTML = `<p>合計: ¥${total}</p>`;
    }
}

// Checkout Process
async function checkout() {
    const total = calculateTotal();

    if (total === 0) {
        alert("カートに商品がありません");
        return;
    }

    try {
        await processCheckout(total);
        alert(`会計が完了しました！合計: ¥${total}`);

        cart = [];
        renderCart();
        renderCartTotal();

        await loadProductList();
    } catch (error) {
        console.error("会計に失敗しました", error);
        alert("会計に失敗しました。再試行してください。");
    }
}

// Calculate Total Price
function calculateTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

async function processCheckout(total) {
    await RKZ.Data.add({
        object_id: 'sales',
        name: "会計データ",
        attributes: {
            items: JSON.stringify(cart.map(item => ({ name: item.name, price: item.price, quantity: item.quantity }))),
            total,
            timestamp: formatDate(new Date())
        }
    });
}

// Sales History Management
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
