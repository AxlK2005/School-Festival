document.addEventListener("DOMContentLoaded", async () => {
    await initSDK();
});

let cart = [];

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

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function renderCart() {
    const cartSection = document.getElementById("cart");
    cartSection.innerHTML = cart.length === 0 ? '<p>カートは空です</p>' : formatCartItems();
    renderCartTotal();
}

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

function addToCart(productId, productName, price, quantity = 1) {
    addItemToCart(productId, productName, price, quantity);
    renderCart();
}

function addItemToCart(productId, productName, price, quantity) {
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id: productId, name: productName, price, quantity });
    }
}

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
