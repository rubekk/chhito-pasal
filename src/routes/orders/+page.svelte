<script>
    import { onMount } from "svelte";
    import { db, auth } from "$lib/firebaseConfig";
    import { onAuthStateChanged } from "firebase/auth";
    import { collection, query, where, onSnapshot } from "firebase/firestore";
    import { authStore } from "$lib/store";
    import { goto } from "$app/navigation";

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

            onSnapshot(
                q,
                (querySnapshot) => {
                    orderHistory = querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));

                    orderHistory.sort((a, b) => {
                        const dateA = new Date(`${a.orderDate} ${a.orderTime}`);
                        const dateB = new Date(`${b.orderDate} ${b.orderTime}`);

                        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
                            console.error('Invalid Date in Order:', dateA, dateB);
                            return 0; 
                        }
                        return dateB - dateA;
                    });

                    loading = false;
                },
                (error) => {
                    console.error("Error fetching order history:", error);
                    loading = false;
                },
            );
        }
    };

    function calculateEstimatedDeliveryTime(order) {
        const orderDateTimeString = `${order.orderDate} ${order.orderTime}`;
        const orderDate = new Date(orderDateTimeString);
        const deliveryDuration = parseInt(order.orderDeliveryTime) || 0;
        const estimatedDelivery = new Date(orderDate.getTime() + deliveryDuration * 60000);

        return estimatedDelivery.toLocaleTimeString('en-US', {
            timeZone: 'Asia/Kathmandu',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
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

<button on:click={() => goto(`/`)} class="back-button">
    <i class="fa-solid fa-arrow-left"></i> <span>Back</span>
</button>
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
                <div class="order-status {order.status === "on the way" ? "on-the-way" : order.status}">
                    Status: {order.status}
                </div>
                {#if order.status === "pending" || order.status === "on the way" || order.status === "packed"}
                    <div class="delivery-message">
                        Your order will be delivered in <strong>{order.orderDeliveryTime}</strong>. (arrive by <strong>{calculateEstimatedDeliveryTime(order)}</strong>)
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
                                <td>Rs {product.discountedPrice}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
                <div class="order-total">
                    <strong
                        >Total: Rs {order.orderProducts.reduce(
                            (total, product) =>
                                total +
                                product.discountedPrice * product.quantity,
                            0,
                        )}</strong
                    >
                </div>
            </div>
        {/each}
    </div>
{/if}

<style>
    .back-button {
        padding: 1rem 1rem 0;
        font-size: 1.25rem;
        background-color: transparent;
        border: none;
        color: var(--blue);
        cursor: pointer;
        display: flex;
        align-items: center;
    }

    .back-button i {
        margin-right: 1rem;
    }

    .back-button span {
        font-size: 1rem;
        color: #000;
    }

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
        padding: 1rem;
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        justify-content: center;
    }

    .order-card {
        width: 100%;
        max-width: 350px;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        background-color: #fff;
        border: 1px solid #eaeaea;
        display: flex;
        flex-direction: column;
        transition:
            transform 0.2s,
            box-shadow 0.2s;
    }

    .order-header {
        display: flex;
        justify-content: space-between;
        font-size: 0.9rem;
        font-weight: bold;
        color: var(--blue);
    }

    .order-status {
        margin: 1rem 0;
        font-size: 0.9rem;
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
        font-weight: bold;
        text-align: center;
    }

    .order-status.pending, .order-status.packed, .order-status.on-the-way {
        background-color: #a9d7d2;
        color: #313131;
    }

    .order-status.delivered {
        background-color: #d4edda;
        color: #155724;
    }

    .delivery-message {
        margin-bottom: 1rem;
        font-size: 0.9rem;
        color: #6c757d;
        font-style: italic;
    }

    .order-items {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 0.5rem;
    }

    .order-items th,
    .order-items td {
        padding: 0.5rem;
        border-bottom: 1px solid #eaeaea;
        text-align: left;
        font-size: 0.8rem;
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
        font-size: 1.1rem;
        font-weight: bold;
        color: var(--green);
    }

    /* media queries */
    @media (max-width: 1200px) {
        .back-button {
            display: flex;
        }
    }
</style>
