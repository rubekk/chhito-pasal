<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { auth, db } from "$lib/firebaseConfig";
    import { onAuthStateChanged } from "firebase/auth";
    import { doc, getDoc, setDoc } from "firebase/firestore";
    import LocationPopup from "./LocationPopup.svelte";
    import Login from "./Login.svelte";
    import {
        authStore,
        storeLocation,
        userLocation,
        cartProducts,
        showCart,
    } from "$lib/store";
    import { getPlaceName, getTravelDetails } from "$lib/utils";

    let sAuthStore = {
        loggedIn: false,
        user: null,
    };
    let sStoreLocation = [];
    let sUserLocation = {};
    let sCartProductsCount = 0;
    let sShowCart = false;
    let showLocationPopup = false;
    let showLoginPopup = false;
    let searchQuery = "";
    let showDropdown = false;
    let phoneNumber = null;
    let showPhoneInputPopup = false;
    let newPhoneNumber = "";

    // store subscriptions
    authStore.subscribe((value) => {
        sAuthStore = value;
    });
    storeLocation.subscribe((value) => {
        sStoreLocation = value;
    });
    userLocation.subscribe((value) => {
        sUserLocation = value;

        setTimeout(() => {
            showLocationPopup = sUserLocation.coords.length == 0;
        }, 500);
    });
    cartProducts.subscribe((value) => {
        sCartProductsCount = value.length;
    });
    showCart.subscribe((value) => {
        sShowCart = value;
    });

    const checkPhoneNumber = async (userId) => {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists() && userDoc.data().phoneNumber) {
            phoneNumber = userDoc.data().phoneNumber;
        } else {
            phoneNumber = null;
        }
    };

    const savePhoneNumber = async () => {
        if (newPhoneNumber.trim()) {
            try {
                await setDoc(
                    doc(db, "users", sAuthStore.user.uid),
                    {
                        phoneNumber: newPhoneNumber,
                    },
                    { merge: true },
                );
                phoneNumber = newPhoneNumber;
                showPhoneInputPopup = false;
                newPhoneNumber = "";
                console.log("Phone number saved successfully.");
            } catch (error) {
                console.error("Error saving phone number:", error);
            }
        }
    };

    const handleKeydown = (event) => {
        if (event.key === "Enter" && searchQuery.trim() !== "") {
            goto(`/search?query=${encodeURIComponent(searchQuery)}`);
        }
    };

    const logOut = () => {
        auth.signOut();
        showDropdown = false;
    };

    onMount(async () => {
        if (localStorage.getItem("geoCoords")) {
            let coords = localStorage.getItem("geoCoords").split(",");

            sUserLocation.coords = coords;
            sUserLocation.place = await getPlaceName(coords[0], coords[1]);

            const [distance, time] = await getTravelDetails(
                sStoreLocation,
                coords,
                10,
            );

            sUserLocation.distance = distance;
            sUserLocation.deliveryTime =
                sUserLocation.distance < 2 ? time : " - ";
            sUserLocation.deliveryAvailable = sUserLocation.distance < 2;

            userLocation.set(sUserLocation);
        }

        onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                sAuthStore.loggedIn = true;
                sAuthStore.user = currentUser;
                checkPhoneNumber(currentUser.uid);
            } else {
                sAuthStore.loggedIn = false;
                sAuthStore.user = null;
            }
        });
    });
</script>

<div class="header">
    <div class="header-left">
        <h1>OnlineMart</h1>
        {#if sUserLocation.place}
            <div
                class="header-delivery-location"
                on:click={() => (showLocationPopup = true)}
            >
                <div class="bold-delivery-location">
                    Delivery in {sUserLocation.deliveryTime} minutes
                </div>
                <div class="header-location">
                    <div class="header-location-txt">{sUserLocation.place}</div>
                    <i class="fa-solid fa-chevron-down"></i>
                </div>
            </div>
        {:else}
            <div
                class="header-delivery-location"
                on:click={() => (showLocationPopup = false)}
            >
                Delivery Location <i class="fa-solid fa-chevron-down"></i>
            </div>
        {/if}
    </div>

    <div class="header-mid">
        <div class="header-search">
            <input
                type="text"
                placeholder="Search 'egg'"
                bind:value={searchQuery}
                on:keydown={handleKeydown}
            />
        </div>
    </div>

    <div class="header-right">
        {#if !sAuthStore.loggedIn}
            <div class="header-login" on:click={() => (showLoginPopup = true)}>
                Login
            </div>
        {:else}
            <div
                class="header-user"
                on:click={() => (showDropdown = !showDropdown)}
            >
                Hi, {sAuthStore.user.displayName}
                <i class="fa-solid fa-chevron-down"></i>
            </div>
            {#if showDropdown}
                <div class="dropdown">
                    {#if phoneNumber}
                        <div class="dropdown-item">
                            Phone: {phoneNumber}
                            <button
                                on:click={() => (showPhoneInputPopup = true)}
                                >Edit</button
                            >
                        </div>
                    {:else}
                        <div class="dropdown-item">
                            <button
                                on:click={() => (showPhoneInputPopup = true)}
                            >
                                Add Phone Number
                            </button>
                        </div>
                    {/if}
                    <div class="dropdown-item" on:click={() => goto("/orders")}>
                        Order history
                    </div>
                    <div class="dropdown-item" on:click={logOut}>Logout</div>
                </div>
            {/if}
        {/if}
        <div class="header-cart" on:click={() => showCart.set(true)}>
            <i class="fa-solid fa-cart-shopping"></i>
            {#if sCartProductsCount > 0}
                <span>{sCartProductsCount}</span>
            {/if}
        </div>
    </div>
</div>

{#if showLocationPopup}
    <div class="popup-overlay"></div>
    <div class="popup-container">
        <LocationPopup />
    </div>
{/if}

{#if showLoginPopup}
    <div class="popup-overlay" on:click={() => (showLoginPopup = false)}></div>
    <div class="popup-container">
        <Login />
    </div>
{/if}

{#if showPhoneInputPopup}
    <div
        class="popup-overlay"
        on:click={() => (showPhoneInputPopup = false)}
    ></div>
    <div class="popup-container">
        <h3>{phoneNumber ? "Edit Phone Number" : "Add Phone Number"}</h3>
        <input
            type="text"
            bind:value={newPhoneNumber}
            placeholder="Enter new phone number"
        />
        <button on:click={savePhoneNumber}>Save</button>
    </div>
{/if}

<style>
    .header {
        padding: 1rem 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #dcdcdc;
    }

    .header-left,
    .header-right {
        display: flex;
        align-items: center;
    }

    .header-left h1 {
        margin-right: 2rem;
    }

    .header-delivery-location {
        cursor: pointer;
    }

    .header-location {
        display: flex;
        align-items: center;
    }

    .bold-delivery-location {
        font-weight: bold;
    }

    .header-location-txt {
        width: 250px;
        font-size: 0.9rem;
        color: #797979;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .header-location i {
        margin-left: -1rem;
    }

    .header-search input {
        padding: 0 1rem;
        width: 700px;
        height: 40px;
        border: 1px solid #dcdcdc;
        border-radius: 3px;
        outline: none;
    }

    .header-login,
    .header-user {
        margin: 0 2rem;
        cursor: pointer;
    }

    .header-user i {
        margin-left: 0.25rem;
    }

    .header-cart {
        position: relative;
        cursor: pointer;
    }

    .header-cart span {
        font-size: 0.8rem;
        position: absolute;
        top: -0.5rem;
        right: -0.75rem;
    }

    .dropdown {
        position: absolute;
        top: 60px;
        right: 20px;
        background-color: white;
        border: 1px solid #dcdcdc;
        border-radius: 3px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        z-index: 10;
    }

    .dropdown-item {
        padding: 10px 20px;
        cursor: pointer;
        border-bottom: 1px solid #f1f1f1;
    }

    .dropdown-item button {
        margin-left: 1rem;
        font-size: 0.9rem;
    }

    .dropdown-item:hover {
        background-color: #f9f9f9;
    }

    .popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 100;
    }

    .popup-container {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        padding: 2rem;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        z-index: 101;
    }

    .popup-container input {
        width: 100%;
        margin-bottom: 1rem;
        padding: 0.75rem;
        border: 1px solid #dcdcdc;
        border-radius: 4px;
    }
</style>
