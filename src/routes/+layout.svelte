<script>
    import "./app.css"; 
    import { onMount } from "svelte";
    import { page } from "$app/stores"; // Import the SvelteKit page store
    import Header from "./../components/Header.svelte";
    import Cart from "../components/Cart.svelte";
    import LocationPopup from "../components/LocationPopup.svelte";
    import {
        authStore,
        showCart,
        userLocation
    } from "$lib/store";
    import { auth } from "$lib/firebaseConfig";
    import { onAuthStateChanged } from "firebase/auth";


    let isHomePage = false;

    let sAuthStore = {
        loggedIn: false,
        user: null,
    };
    let sShowLocationPopup = false;
    let sShowCart = false;
    let deliveryAvailable = true;

    authStore.subscribe((value) => {
        sAuthStore = value;
    });
    showCart.subscribe((value) => {
        sShowCart = value;
    });
    userLocation.subscribe((value) => {
        deliveryAvailable = value.deliveryAvailable;
    });

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
    });

    $: {
        isHomePage = $page.url.pathname === "/";
    }
</script>

<div class={isHomePage ? 'header-layout' : 'header-layout mobile'}>
    <Header />
</div>
{#if deliveryAvailable}
    <div class="slot-container">
        <slot />
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
    .location-popup-container {
        position: absolute;
        top: 5rem;
        left: 10rem;
        z-index: 120;
    }
    .cart-container {
        position: fixed;
        top: 0;
        right: 0;
        z-index: 110;
    }
    .slot-container{
        padding: 0 5rem;
    }

    /* media queries */
    @media(max-width: 1200px) {
        .mobile {
            display: none;
        }
       .slot-container {
            padding: 0 2rem;
       } 
    }
    @media(max-width: 800px) {
       .slot-container {
            padding: 0;
       } 
    }
</style>