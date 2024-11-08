// Ensure the DOM is fully loaded before running JavaScript
document.addEventListener("DOMContentLoaded", main);

async function main() {
    RKZ.config.appAuthUsername = '93af461084793fe02a394f7efb844716'
    RKZ.config.appAuthPassword = '7e38pBSP'
    try {
        await RKZ.init('bp.dfe961aeed90d0de45399e988ae2e069ee827bfc')
        console.log('SDKの初期化に成功しました！')
        await loadProductList();
    } catch (error) {
        console.error("SDKの初期化に失敗しました", error);
        alert('SDKの初期化に失敗しました。もう一度お試しください。');
    }
}

// 商品登録機能
async function registerProduct() {
    const name = document.getElementById("productName").value;
    const price = parseInt(document.getElementById("productPrice").value);
    const quantity = parseInt(document.getElementById("productQuantity").value);

    if (!name || isNaN(price) || price <= 0 || isNaN(quantity) || quantity <= 0) {
        alert("すべての項目を正しく入力してください（価格と数量は正の数である必要があります）");
        return;
    }

    try {
        await RKZ.Data.add({
            object_id: 'product',
            name: name,
            attributes: {
                price: price,
                quantity: quantity
            }
        });
        alert("商品を登録しました！");
        document.getElementById("register-form").reset();
        await loadProductList();
    } catch (error) {
        console.error("商品登録に失敗しました", error);
        alert("商品登録に失敗しました。");
    }
}

// カートとレジ機能
let cart = [];

async function loadProductList() {
    try {
        const products = await RKZ.Data.query('product').find();
        console.log('データの取得に成功しました！');
        renderProductList(products.data);
    } catch (error) {
        console.error("商品情報の取得に失敗しました", error);
    }
}

function renderProductList(products) {
    const productList = document.getElementById("product-list");

    if (!productList) {
        console.error("商品リストの表示エリアが見つかりません (ID: 'product-list')");
        return;
    }

    productList.innerHTML = '';

    products.forEach(product => {
        const productElement = document.createElement("div");
        productElement.classList.add("product-item");
        productElement.textContent = `${product.name} - ¥${product.attributes.price}`;

        const addButton = document.createElement("button");
        addButton.textContent = "追加";
        addButton.onclick = () => addToCart(product.code, product.name, product.attributes.price);

        productElement.appendChild(addButton);
        productList.appendChild(productElement);
    });
}

function addToCart(productId, productName, price) {
    cart.push({ id: productId, name: productName, price });
    alert(`${productName} をカートに追加しました`);
}

async function checkout() {
    const total = cart.reduce((sum, item) => sum + item.price, 0);

    if (total === 0) {
        alert("カートに商品がありません");
        return;
    }

    try {
        await RKZ.Data.add({
            object_id: 'sales',
            attributes: {
                items: cart,
                total,
                timestamp: new Date().toISOString()
            }
        });
        alert(`会計が完了しました！合計: ¥{total}`);
        cart = [];
        document.getElementById("product-list").innerHTML = ""; // Clear the cart
        await loadProductList();
    } catch (error) {
        console.error("会計に失敗しました", error);
        alert("会計に失敗しました。再試行してください。");
    }
}

// 販売履歴の読み込み
async function loadSalesHistory() {
    try {
        const dataResult = await RKZ.Data.query('sales').asc('timestamp').find();
        renderSalesHistory(dataResult.data);
    } catch (error) {
        console.error("販売履歴の取得に失敗しました", error);
    }
}

function renderSalesHistory(salesData) {
    const salesHistory = document.getElementById("sales-history");
    salesHistory.innerHTML = '';

    salesData.forEach(sale => {
        const saleElement = document.createElement("div");
        saleElement.classList.add("sale-entry");
        saleElement.innerHTML = `<p>日時: ${new Date(sale.timestamp).toLocaleString()}</p><p>合計: ¥${sale.total}</p>`;
        salesHistory.appendChild(saleElement);
    });
}
