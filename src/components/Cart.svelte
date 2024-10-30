<script>
    import { authStore, userLocation, storeOpen, cartProducts, showCart } from "$lib/store";
    import { db } from "$lib/firebaseConfig";
    import { collection, addDoc } from "firebase/firestore";
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
    let totalSavings = 0;
    let deliveryCharge = 20;
    let phoneInput = ""; 
    let phoneNumber = null;
    let sStoreOpen = true;

    authStore.subscribe((value) => {
        sAuthStore = value;
    });
    userLocation.subscribe((value) => {
        sUserLocation = value;
    });
    cartProducts.subscribe((value) => {
        sCartProducts = value;
    });
    storeOpen.subscribe(value => {
        sStoreOpen = value;
    })

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

        handleTotalSavings();
    };

    const handleTotalSavings = () => {
        totalSavings = 0;
        sCartProducts.forEach(product => {
            totalSavings += ((product.price - product.discountedPrice) * product.count);
        })
    }

    const confirmOrder = async () => {
        if (!sAuthStore.loggedIn || !phoneInput) {
            alert("Please log in and provide a phone number to confirm the order.");
            return;
        }
        if (!sUserLocation.coords.length>0) {
            alert("Please provide your location");
            return;
        }

        const orderTime = new Date().toLocaleTimeString('en-US', {
            timeZone: 'Asia/Kathmandu',
            hour12: true
        });
        const orderDate = new Date().toISOString().split('T')[0];
        const orderDay = new Date().toLocaleDateString("en-US", {
            weekday: "long",
        });

        const stockPromises = sCartProducts.map((product) =>
            getDoc(doc(db, "products", product.id)),
        );

        const stockDocs = await Promise.all(stockPromises);

        let insufficientStockMessage = "";
        let isStockAvailable = true;

        stockDocs.forEach((doc, index) => {
            if (doc.exists()) {
                const productData = doc.data();
                const availableStock = productData.stock;

                if (sCartProducts[index].count > availableStock) {
                    insufficientStockMessage += `Due to high demand, ${sCartProducts[index].count} ${sCartProducts[index].productName} are not available. However, ${availableStock} remains.`;
                    sCartProducts[index].count = availableStock;
                    isStockAvailable = false;
                }
            }
        });

        if (!isStockAvailable) {
            alert(insufficientStockMessage.trim());
            cartProducts.set(sCartProducts);
            return;
        }

        const orderData = {
            orderDate,
            orderTime,
            orderDay,
            orderLocation: sUserLocation.place,
            orderDistance: sUserLocation.distance,
            orderLocationCoords: sUserLocation.coords,
            orderDeliveryTime: sUserLocation.deliveryTime + " mins",
            orderUserId: sAuthStore.user.uid,
            orderUsername: sAuthStore.user.displayName,
            orderPhoneNumber: phoneInput, 
            orderEmail: sAuthStore.user.email,
            orderProducts: sCartProducts.map((product) => ({
                productName: product.productName,
                discountedPrice: product.discountedPrice,
                quantity: product.count,
            })),
            status: "pending",
        };

        try {
            const orderRef = await addDoc(collection(db, "orders"), orderData);

            await Promise.all(
                sCartProducts.map(async (product) => {
                    const productRef = doc(db, "products", product.id);
                    const newStock = product.stock - product.count;
                    await updateDoc(productRef, { stock: newStock });
                }),
            );

            cartProducts.set([]);
            closeCart();
        } catch (error) {
            console.error("Error adding order: ", error);
        }
    };

    $: if (sCartProducts) handleTotalPrice();
    $: deliveryCharge = totalPrice >= 300 ? 0 : 20;

    if (sAuthStore.loggedIn) {
        getDoc(doc(db, "users", sAuthStore.user.uid)).then((userDoc) => {
            if (userDoc.exists() && userDoc.data().phoneNumber) {
                phoneNumber = userDoc.data().phoneNumber;
                phoneInput = phoneNumber; 
            }
        });
    }
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
                                Rs. {cartProduct.discountedPrice ? cartProduct.discountedPrice : cartProduct.price} x {cartProduct.count} = Rs.
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
            <div>Delivery Charge: <span>{deliveryCharge > 0 ? `Rs. ${deliveryCharge}` : 'Free'}</span></div>
            <div class="savings">
                Savings <span>Rs. {totalSavings}</span>
            </div>
            <div class="total-amount">
                Total Amount: <span>Rs. {totalPrice + deliveryCharge}</span>
            </div>
    
            {#if sAuthStore.loggedIn && sStoreOpen}
                <div class="phone-input-section">
                    <label for="phone">Phone:</label>
                    <input
                        type="text"
                        id="phone"
                        bind:value={phoneInput}
                        placeholder="Enter your phone number"
                    />
                </div>
                <button class="confirm-order-btn" on:click={confirmOrder}>
                    Confirm Order
                </button>
            {:else if !sStoreOpen}
                <div class="time-message">
                    Sorry :( We're closed now.
                </div>
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
        padding: 1rem 1.5rem;
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
        margin-bottom: 1rem;
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
        overflow-y: auto; 
        margin-bottom: 1rem; 
    }

    .cart-product {
        display: flex;
        align-items: center;
        padding: .75rem 0;
        border-bottom: 1px solid #e0e0e0;
    }

    .cart-product-img {
        margin-right: 1rem;
        width: 70px;
        height: 70px;
        border-radius: 8px;
        object-fit: contain;
    }

    .cart-product-details {
        flex-grow: 1;
    }

    .cart-product-name {
        font-size: .9rem;
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
        margin-bottom: 0.5rem;
    }

    .savings {
        font-style: italic;
        color: var(--green);
    }

    .total-amount {
        font-weight: bold;
        color: var(--green);
    }

    .confirm-order-btn {
        margin-top: .5rem;
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

    .time-message, .login-prompt {
        color: #e74c3c;
        font-weight: bold;
        text-align: center;
        margin-top: 1rem;
    }

    .phone-input-section {
        display: flex;
        align-items: center;
        margin-top: .5rem;
        gap: 1rem;
    }

    .phone-input-section label {
        margin-right: 1rem;
    }

    .phone-input-section input {
        padding: 0.5rem;
        width: 100%;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    .login-prompt {
        color: red;
        margin-top: 1rem;
    }
</style>
