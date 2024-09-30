<script>
    import "./app.css";
    import { onMount } from "svelte";
    import Header from "../components/Header.svelte";
    import Product from "../components/Product.svelte";
    import Cart from "../components/Cart.svelte";
    import LocationPopup from "../components/LocationPopup.svelte";
    import { authStore, productsData, showCart, userLocation } from "$lib/store";
    import { auth } from "$lib/firebaseConfig"; 
    import { onAuthStateChanged } from "firebase/auth";

    let sAuthStore = {
        loggedIn: false,
        user: null
    };
    let sProductsData= [];
    let sShowLocationPopup= false;
    let sShowCart= false;
    let deliveryAvailable = true;

    authStore.subscribe(value => {
        sAuthStore = value
    })
    productsData.subscribe(value =>{
        sProductsData= value
    })
    showCart.subscribe(value =>{
        sShowCart=value
    })
    userLocation.subscribe(value => {
        deliveryAvailable = value.deliveryAvailable
    })

    onMount(() => {
        onAuthStateChanged(auth, (currentUser) => {
            if(currentUser) {
                sAuthStore.loggedIn = true;
                sAuthStore.user = currentUser;
            }
            else{
                sAuthStore.loggedIn = false;
                sAuthStore.user = null;
            }
        });
    });
</script>

<Header />
{#if deliveryAvailable}
<div class="products-container">
    {#each sProductsData as productData}
    <Product productData={productData} />
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
    .products-container{    
        padding: 2rem 1rem;
        margin: auto;
        max-width: 1000px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
    }
    .location-popup-container{
        position: absolute;
        top: 5rem;
        left: 10rem;
        z-index: 2;
    }
    .cart-container{
        position: fixed;
        top: 0;
        right: 0;
    }
</style>