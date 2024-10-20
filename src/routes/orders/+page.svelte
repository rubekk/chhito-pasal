<script>
    import { onMount } from "svelte";
    import { db, auth } from "$lib/firebaseConfig";
    import { onAuthStateChanged } from "firebase/auth";
    import { collection, query, where, onSnapshot } from "firebase/firestore";
    import { authStore } from "$lib/store";

    let sAuthStore = { loggedIn: false, user: null };
    let orderHistory = [];
    let loading = true;

    authStore.subscribe((value) => {
        sAuthStore = value;
    });

    const getOrderHistory = async () => {
        if (sAuthStore.loggedIn && sAuthStore.user) {
            const ordersRef = collection(db, "orders");
            const q = query(
                ordersRef,
                where("orderUserId", "==", sAuthStore.user.uid),
            );

            // Use onSnapshot to listen for changes in real-time
            onSnapshot(
                q,
                (querySnapshot) => {
                    orderHistory = querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    loading = false; // Stop loading once data is fetched
                },
                (error) => {
                    console.error("Error fetching order history:", error);
                    loading = false;
                },
            );
        }
    };

    function calculateEstimatedDeliveryTime(order) {
        const orderDate = new Date(`${order.orderDate} ${order.orderTime}`);
        const deliveryDuration = parseInt(order.orderDeliveryTime) || 0; // Delivery duration in minutes
        const estimatedDelivery = new Date(
            orderDate.getTime() + deliveryDuration * 60000,
        ); // Adding minutes to order time
        return estimatedDelivery.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        }); // Format as HH:MM AM/PM
    }

    onMount(() => {
        onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                sAuthStore.loggedIn = true;
                sAuthStore.user = currentUser;
                getOrderHistory();
            } else {
                sAuthStore.loggedIn = false;
                sAuthStore.user = null;
            }
        });
    });
</script>

{#if !sAuthStore.loggedIn}
    <div class="loading-container">
        <p>Login to view your orders...</p>
    </div>
{:else if loading}
    <div class="loading-container">
        <p>Loading your order history...</p>
    </div>
{:else if orderHistory.length === 0}
    <div class="no-orders">
        <p>You haven't placed any orders yet.</p>
    </div>
{:else}
    <div class="order-history-container">
        {#each orderHistory as order}
            <div class="order-card">
                <div class="order-header">
                    <span class="order-date">{order.orderDate}</span>
                    <span class="order-time">{order.orderTime}</span>
                </div>
                <div class="order-status {order.status}">
                    Status: {order.status}
                </div>
                {#if order.status === "pending" || order.status === "on the way"}
                    <div class="delivery-message">
                        Delivery time: {order.orderDeliveryTime}. Your order
                        will arrive by {calculateEstimatedDeliveryTime(order)}.
                    </div>
                {/if}
                <table class="order-items">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each order.orderProducts as product}
                            <tr>
                                <td>{product.productName}</td>
                                <td>{product.quantity}</td>
                                <td>Rs {product.price}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
                <div class="order-total">
                    <strong
                        >Total: Rs {order.orderProducts.reduce(
                            (total, product) =>
                                total + product.price * product.quantity,
                            0,
                        )}</strong
                    >
                </div>
            </div>
        {/each}
    </div>
{/if}

<style>
    .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        font-size: 1.5rem;
        color: #666;
    }

    .no-orders {
        text-align: center;
        margin-top: 3rem;
        font-size: 1.2rem;
        color: #666;
    }

    .order-history-container {
        padding: 1rem; /* Reduced padding for a more compact look */
        display: flex;
        flex-wrap: wrap;
        gap: 1rem; /* Reduced gap for tighter spacing */
        justify-content: center;
    }

    .order-card {
        width: 100%;
        max-width: 350px; /* Reduced max width */
        padding: 1rem; /* Reduced padding */
        border-radius: 8px; /* Slightly less rounding */
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Reduced shadow */
        background-color: #fff;
        border: 1px solid #eaeaea;
        display: flex;
        flex-direction: column;
        transition: transform 0.2s, box-shadow 0.2s;
    }

    .order-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem; /* Reduced margin */
        font-size: 0.9rem; /* Smaller font size */
        font-weight: bold;
        color: var(--blue);
    }

    .order-status {
        font-size: 0.9rem; /* Smaller font size */
        margin-bottom: 0.3rem; /* Reduced margin */
        padding: 0.2rem 0.4rem; /* Reduced padding */
        border-radius: 4px; /* Slightly less rounding */
        font-weight: bold;
        text-align: center;
    }

    .order-status.pending {
        background-color: #fff3cd;
        color: #856404;
    }

    .order-status.on-the-way {
        background-color: #d1ecf1;
        color: #0c5460;
    }

    .order-status.delivered {
        background-color: #d4edda;
        color: #155724;
    }

    .delivery-message {
        margin: 0.3rem 0; /* Reduced margin */
        font-size: 0.9rem; /* Smaller font size */
        color: #6c757d;
        font-style: italic;
    }

    .order-items {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 0.5rem; /* Reduced margin */
    }

    .order-items th,
    .order-items td {
        padding: 0.5rem; /* Reduced padding */
        border-bottom: 1px solid #eaeaea;
        text-align: left;
        font-size: 0.8rem; /* Smaller font size */
    }

    .order-items th {
        background-color: var(--blue);
        color: #fff;
        font-weight: 600;
    }

    .order-items td {
        color: #555;
    }

    .order-total {
        text-align: right;
        font-size: 1.1rem; /* Slightly smaller font size */
        font-weight: bold;
        color: var(--green);
    }
</style>

