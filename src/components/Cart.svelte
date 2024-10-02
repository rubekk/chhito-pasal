<script>
    import { cartProducts, showCart } from "$lib/store";
    import { db } from "$lib/firebaseConfig";
    import { collection, addDoc } from "firebase/firestore";
    import { authStore, userLocation } from "$lib/store";
    import { doc, getDoc, updateDoc } from "firebase/firestore";

    let sAuthStore = {
        loggedIn: false,
        user: null,
    };
    let sUserLocation = {
        coords: [],
        place: "",
        distance: 0,
        deliveryTime: 0,
        deliveryAvailable: false,
    };
    let sCartProducts = [];
    let totalPrice = 0;
    let deliveryCharge = 0;

    authStore.subscribe((value) => {
        sAuthStore = value;
    });
    userLocation.subscribe((value) => {
        sUserLocation = value;
    });
    cartProducts.subscribe((value) => {
        sCartProducts = value;
    });

    const closeCart = () => {
        showCart.set(false);
    };

    const handleCartMinus = (id) => {
        let i = sCartProducts.findIndex((product) => product.id == id);
        if (i < 0) return;
        if (sCartProducts[i].count > 0) sCartProducts[i].count--;
        if (sCartProducts[i].count == 0) sCartProducts.splice(i, 1);
        sCartProducts = [...sCartProducts];
        cartProducts.set(sCartProducts);
        if (sCartProducts[i]?.count > 0) handleSingleProductPrice(id);
    };

    const handleCartPlus = (id) => {
        let i = sCartProducts.findIndex((product) => product.id == id);
        if (i < 0 || sCartProducts[i].count >= sCartProducts[i].stock) return;
        sCartProducts[i].count++;
        sCartProducts = [...sCartProducts];
        cartProducts.set(sCartProducts);
        handleSingleProductPrice(id);
    };

    const handleSingleProductPrice = (id) => {
        let i = sCartProducts.findIndex((product) => product.id == id);
        if (i < 0) return;
        sCartProducts[i].totalPrice =
            sCartProducts[i].count * sCartProducts[i].price;
        handleTotalPrice();
    };

    const handleTotalPrice = () => {
        totalPrice = 0;
        sCartProducts.forEach((product) => {
            totalPrice += product.totalPrice;
        });
    };

    const confirmOrder = async () => {
        if (!sAuthStore.loggedIn) return;

        const orderTime = new Date().toLocaleTimeString();
        const orderDate = new Date().toLocaleDateString();
        const orderDay = new Date().toLocaleDateString("en-US", {
            weekday: "long",
        });

        let phoneNumber = null;

        const userDoc = await getDoc(doc(db, "users", sAuthStore.user.uid));
        if (userDoc.exists() && userDoc.data().phoneNumber) {
            phoneNumber = userDoc.data().phoneNumber;
        } else {
            phoneNumber = null;
        }

        // Fetch the current stock for each product
        const stockPromises = sCartProducts.map((product) =>
            getDoc(doc(db, "products", product.id)),
        );

        const stockDocs = await Promise.all(stockPromises);

        // Adjust quantities based on available stock
        let insufficientStockMessage = "";
        let isStockAvailable = true;

        stockDocs.forEach((doc, index) => {
            if (doc.exists()) {
                const productData = doc.data();
                const availableStock = productData.stock;

                if (sCartProducts[index].count > availableStock) {
                    insufficientStockMessage += `Due to high demand,  ${sCartProducts[index].count} ${sCartProducts[index].productName} are not available. However, ${availableStock} remains.`;
                    sCartProducts[index].count = availableStock; 
                    isStockAvailable = false;
                }
            }
        });

        if (!isStockAvailable) {
            alert(insufficientStockMessage.trim()); // or use a more user-friendly notification method
            cartProducts.set(sCartProducts); // Update the cart state after adjusting quantities

            return;
        }

        if (
            stockDocs.some(
                (doc, index) =>
                    doc.exists() &&
                    sCartProducts[index].count > doc.data().stock,
            )
        ) {
            return;
        }

        const orderData = {
            orderDate,
            orderTime,
            orderDay,
            orderLocation: sUserLocation.place,
            orderDistance: sUserLocation.distance,
            orderLocationCoords: sUserLocation.coords,
            orderDeliveryTime: sUserLocation.deliveryTime + "mins",
            orderUserId: sAuthStore.user.uid,
            orderUsername: sAuthStore.user.displayName,
            orderPhoneNumber: phoneNumber,
            orderEmail: sAuthStore.user.email,
            orderProducts: sCartProducts.map((product) => ({
                productName: product.productName,
                price: product.price,
                quantity: product.count,
            })),
        };

        try {
            // Add the order to Firestore
            const orderRef = await addDoc(collection(db, "orders"), orderData);

            // Update the stock for each ordered product
            await Promise.all(
                sCartProducts.map(async (product) => {
                    const productRef = doc(db, "products", product.id);
                    const newStock = product.stock - product.count;

                    // Update the product stock in the database
                    await updateDoc(productRef, { stock: newStock });
                }),
            );

            // Clear the cart and close it
            cartProducts.set([]);
            closeCart();
        } catch (error) {
            console.error("Error adding order: ", error);
        }
    };

    $: if (sCartProducts) handleTotalPrice();
</script>

<div class="cart-products-container">
    <div class="cart-header">
        <button class="cart-close-btn" on:click={closeCart}>
            <i class="fa-solid fa-times"></i>
        </button>
        <h2 class="cart-title">Your Cart</h2>
    </div>

    {#if sCartProducts.length === 0}
        <div class="empty-cart-message">
            The cart is empty, add products to the cart.
        </div>
    {:else}
        <div class="cart-products-list">
            {#each sCartProducts as cartProduct}
                <div class="cart-product">
                    <img
                        class="cart-product-img"
                        src={cartProduct.imageUrl}
                        alt=""
                    />
                    <div class="cart-product-details">
                        <div class="cart-product-name">
                            {cartProduct.productName}
                        </div>
                        <div class="cart-product-info">
                            <div class="cart-product-price">
                                Rs. {cartProduct.price} x {cartProduct.count} = Rs.
                                {cartProduct.totalPrice}
                            </div>
                            <div class="cart-product-controls">
                                <button
                                    class="cart-product-minus-btn"
                                    on:click={() =>
                                        handleCartMinus(cartProduct.id)}
                                >
                                    <i class="fa-solid fa-minus"></i>
                                </button>
                                <div class="cart-product-count">
                                    {cartProduct.count}
                                </div>
                                <button
                                    class="cart-product-plus-btn"
                                    on:click={() =>
                                        handleCartPlus(cartProduct.id)}
                                >
                                    <i class="fa-solid fa-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>

        <div class="cart-summary">
            <div>Total Price: <span>Rs. {totalPrice}</span></div>
            <div>Delivery Charge: <span>Rs. {deliveryCharge}</span></div>
            <div class="total-amount">
                Total Amount: <span>Rs. {totalPrice + deliveryCharge}</span>
            </div>
            {#if sAuthStore.loggedIn}
                <button class="confirm-order-btn" on:click={confirmOrder}
                    >Confirm Order</button
                >
            {:else}
                <div class="login-prompt">
                    You need to log in to confirm your order.
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    .cart-products-container {
        padding: 2rem 2rem 1rem;
        width: 350px;
        height: 100vh;
        background-color: #fff;
        border-left: 2px solid #ddd;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        position: fixed;
        right: 0;
        top: 0;
        z-index: 1000;
        display: flex;
        flex-direction: column;
    }

    .cart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }

    .cart-title {
        font-size: 1.5rem;
        font-weight: bold;
        margin: 0;
    }

    .cart-close-btn {
        font-size: 1.25rem;
        background-color: transparent;
        border: none;
        cursor: pointer;
    }

    .cart-products-list {
        flex-grow: 1;
        overflow-y: auto; /* Enables scrolling */
        margin-bottom: 1rem; /* Space for the summary section */
    }

    .cart-product {
        display: flex;
        align-items: center;
        padding: 1rem 0;
        border-bottom: 1px solid #e0e0e0;
        margin-bottom: 1rem;
    }

    .cart-product-img {
        width: 70px;
        height: 70px;
        border-radius: 8px;
        object-fit: cover;
        margin-right: 1rem;
    }

    .cart-product-details {
        flex-grow: 1;
    }

    .cart-product-name {
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }

    .cart-product-info {
        font-size: 0.9rem;
        color: #555;
    }

    .cart-product-controls {
        display: flex;
        align-items: center;
        margin-top: 0.5rem;
    }

    .cart-product-count {
        margin: 0 0.75rem;
        font-weight: 600;
        font-size: 1rem;
    }

    .cart-product-minus-btn,
    .cart-product-plus-btn {
        background-color: #f0f0f0;
        border: none;
        padding: 0.5rem;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.9rem;
    }

    .cart-product-minus-btn:hover,
    .cart-product-plus-btn:hover {
        background-color: var(--blue);
        color: white;
    }

    .cart-summary {
        padding: 1rem;
        margin-top: 1rem;
        background-color: #fafafa;
        border: 1px solid #dcdcdc;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    }

    .cart-summary div {
        display: flex;
        justify-content: space-between;
        font-size: 1rem;
        margin-bottom: 0.5rem;
    }

    .total-amount {
        font-weight: bold;
        font-size: 1.2rem;
        color: var(--green);
    }

    .confirm-order-btn {
        margin-top: 1rem;
        width: 100%;
        padding: 0.75rem;
        background-color: var(--blue);
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
    }

    .empty-cart-message {
        text-align: center;
        color: #999;
        margin-top: 2rem;
    }

    .login-prompt {
        color: #e74c3c;
        font-weight: bold;
        text-align: center;
        margin-top: 1rem;
    }
</style>
