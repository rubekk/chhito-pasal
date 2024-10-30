<script>
    import "./app.css";
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import Welcome from "../components/Welcome.svelte";
    import Header from "./../components/Header.svelte";
    import Cart from "../components/Cart.svelte";
    import LocationPopup from "../components/LocationPopup.svelte";
    import {
        authStore,
        showCart,
        userLocation,
        welcomeShown,
    } from "$lib/store";
    import { auth } from "$lib/firebaseConfig";
    import { onAuthStateChanged } from "firebase/auth";
    import { fade } from 'svelte/transition';

    let isHomePage = false;

    let sAuthStore = {
        loggedIn: false,
        user: null,
    };
    let sShowLocationPopup = false;
    let sShowCart = false;
    let sWelcomeShown = false;
    let deliveryAvailable = true;
    let showWelcome = true;
    let runTransition = false;

    authStore.subscribe((value) => {
        sAuthStore = value;
    });
    showCart.subscribe((value) => {
        sShowCart = value;
    });
    userLocation.subscribe((value) => {
        deliveryAvailable = value.deliveryAvailable;
    });
    welcomeShown.subscribe((value) => {
        sWelcomeShown = value;
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

        setTimeout(() => {
            showWelcome = false;
            runTransition = true;
        }, 2500);
    });

    $: {
        isHomePage = $page.url.pathname === "/";
    }
</script>

<svelte:head>
    <title>ChhitoPasal - Groceries delivered in minutes</title>
</svelte:head>

{#if showWelcome}
    <Welcome />
{:else if runTransition}
    <div class="container" transition:fade={{duration: 1000}}>
        <div class={isHomePage ? "header-layout" : "header-layout mobile"}>
            <Header />
        </div>
        {#if deliveryAvailable}
            <div class="slot-container">
                <slot />
            </div>
        {:else}
            <div class="not-available">
                <p>
                    Sorry, we are not available at your location <strong
                        >yet!</strong
                    >
                </p>
                <img src="/sad.png" alt="" />
            </div>
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
    .slot-container {
        padding: 0 5rem;
    }
    .not-available {
        margin: 2rem auto;
        width: max-content;
        display: flex;
        align-items: center;
        flex-direction: column;
        gap: 1rem;
    }

    /* media queries */
    @media (max-width: 1200px) {
        .mobile {
            display: none;
        }
        .slot-container {
            padding: 0 2rem;
        }
    }
    @media (max-width: 800px) {
        .slot-container {
            padding: 0;
        }
    }
</style>
