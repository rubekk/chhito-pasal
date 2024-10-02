<script>
    import "./app.css";
    import { onMount } from "svelte";
    import Product from "../components/Product.svelte";
    import Category from "../components/Category.svelte";
    import Cart from "../components/Cart.svelte";
    import LocationPopup from "../components/LocationPopup.svelte";
    import {
        authStore,
        productsData,
        categories,
        showCart,
        userLocation,
    } from "$lib/store";
    import { auth, db } from "$lib/firebaseConfig";
    import { onAuthStateChanged } from "firebase/auth";
    import { collection, getDocs, onSnapshot } from "firebase/firestore";

    let sAuthStore = {
        loggedIn: false,
        user: null,
    };
    let sProductsData = [];
    let sShowLocationPopup = false;
    let sShowCart = false;
    let deliveryAvailable = true;

    authStore.subscribe((value) => {
        sAuthStore = value;
    });
    productsData.subscribe((value) => {
        sProductsData = value;
    });
    showCart.subscribe((value) => {
        sShowCart = value;
    });
    userLocation.subscribe((value) => {
        deliveryAvailable = value.deliveryAvailable;
    });

    const getAllProducts = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "products"));
            sProductsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            productsData.set(sProductsData);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const listenToProductChanges = () => {
        const productsRef = collection(db, "products");

        onSnapshot(productsRef, (querySnapshot) => {
            querySnapshot.docChanges().forEach((change) => {
                const updatedData = change.doc.data();

                if (change.type === "modified") {
                    const index = sProductsData.findIndex(
                        (product) => product.id === change.doc.id,
                    );

                    if (index !== -1) {
                        sProductsData[index] = {
                            ...sProductsData[index],
                            stock: updatedData.stock,
                            price: updatedData.price,
                            discountedPrice: updatedData.discountedPrice,
                        };

                        productsData.set([...sProductsData]);
                    }
                }
            });
        });
    };

    onMount(() => {
        onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                sAuthStore.loggedIn = true;
                sAuthStore.user = currentUser;
            } else {
                sAuthStore.loggedIn = false;
                sAuthStore.user = null;
            }
        });

        getAllProducts();
        listenToProductChanges();
    });
</script>

{#if deliveryAvailable}
    <div class="products-container">
        {#each sProductsData as productData}
            <Product {productData} />
        {/each}
    </div>
    <div class="categories-container">
        {#each categories as category}
            <Category {category} />
        {/each}
    </div>
{:else}
    Sorry, we are not available at your location yet!
{/if}
{#if sShowLocationPopup}
    <div class="location-popup-container">
        <LocationPopup />
    </div>
{/if}
{#if sShowCart && deliveryAvailable}
    <div class="cart-container">
        <Cart />
    </div>
{/if}

<style>
    .products-container,
    .categories-container {
        padding: 2rem 0;
        margin: auto;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.75rem;
    }
    .location-popup-container {
        position: absolute;
        top: 5rem;
        left: 10rem;
        z-index: 2;
    }
    .cart-container {
        position: fixed;
        top: 0;
        right: 0;
    }
</style>
