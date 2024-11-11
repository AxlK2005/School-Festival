document.addEventListener("DOMContentLoaded", async () => {
    await initSDK();
    await loadProductList();
});

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

    const isCartPage = window.location.pathname.includes("cart.html");
    const isProductPage = window.location.pathname.includes("product.html");

    products.forEach(product => {
        const productElement = document.createElement("div");
        productElement.classList.add("product-item");

        productElement.innerHTML = `
            <span>${product.name} - ¥${product.attributes.price}</span>
        `;

        if (isCartPage) {
            productElement.addEventListener("click", () => {
                addToCart(product.code, product.name, product.attributes.price, 1);
            });
        }

        if (isProductPage) {
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "削除";
            deleteButton.onclick = () => deleteProduct(product.code);
            productElement.appendChild(deleteButton);
        }

        fragment.appendChild(productElement);
    });
    productList.appendChild(fragment);
}

async function deleteProduct(code) {
    try {
        await deleteProductFromDatabase(code);
        alert("商品を削除しました！");
        await loadProductList();
    } catch (error) {
        console.error("商品削除に失敗しました", error);
        alert("商品削除に失敗しました。");
    }
}

async function deleteProductFromDatabase(code) {
    await RKZ.Data.query('product')
        .equalTo('code', code)
        .delete();
}
