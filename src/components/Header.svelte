<script>
    import { onMount, onDestroy } from "svelte";
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";
    import { auth, db } from "$lib/firebaseConfig";
    import { onAuthStateChanged } from "firebase/auth";
    import { doc, setDoc, onSnapshot } from "firebase/firestore";
    import LocationPopup from "./LocationPopup.svelte";
    import Login from "./Login.svelte";
    import {
        authStore,
        storeLocation,
        storeOpen,
        userLocation,
        hasPhone,
        cartProducts,
        showCart
    } from "$lib/store";
    import { getPlaceName, getTravelDetails } from "$lib/utils";

    let sAuthStore = {
        loggedIn: false,
        user: null,
    };
    let sStoreLocation = [];
    let sUserLocation = {};
    let sHasPhone = false;
    let sCartProductsCount = 0;
    let sShowCart = false;
    let sStoreOpen = true;
    let showLocationPopup = false;
    let showLoginPopup = false;
    let searchQuery = "";
    let showDropdown = false;
    let phoneNumber = null;
    let showPhoneInputPopup = false;
    let newPhoneNumber = "";
    let timeMessage = null;

    let searchHolders = ["rice", "egg", "chips", "biscuits", "masala", "everything"];
    let i = 0;
    let searchHolder = searchHolders[i];

    setInterval(() => {
        searchHolder = searchHolders[i];
        i++;
        i = i>5 ? 0 : i;
    }, 2500);

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
    storeOpen.subscribe((value) => {
        sStoreOpen = value;
    });
    hasPhone.subscribe((value) => {
        sHasPhone = value;

        showLoginPopup = !sHasPhone && sAuthStore.loggedIn;
    });
    cartProducts.subscribe((value) => {
        sCartProductsCount = value.length;
    });
    showCart.subscribe((value) => {
        sShowCart = value;
    });

    const checkPhoneNumber = (userId) => {
        const userDocRef = doc(db, "users", userId);

        onSnapshot(userDocRef, (userDoc) => {
            if (userDoc.exists() && userDoc.data().phoneNumber) {
                phoneNumber = userDoc.data().phoneNumber;
            } else {
                phoneNumber = null;
            }
        });
    };

    const savePhoneNumber = async () => {
        if (newPhoneNumber.trim()) {
            try {
                await setDoc(
                    doc(db, "users", sAuthStore.user.uid),
                    {
                        phoneNumber: newPhoneNumber,
                        email: sAuthStore.user.email,
                        uid: sAuthStore.user.uid,
                    },
                    { merge: true },
                );
                phoneNumber = newPhoneNumber;
                showPhoneInputPopup = false;
                newPhoneNumber = "";
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

    const handleSearch = () => {
        if (searchQuery.trim() !== "") {
            goto(`/search?query=${encodeURIComponent(searchQuery)}`);
        }
    };

    const logOut = () => {
        auth.signOut();
        showDropdown = false;
    };

    const handleOutsideClick = (event) => {
        const dropdown = document.querySelector(".dropdown");
        const userButton = document.querySelector(".header-user");

        if (
            showDropdown &&
            dropdown &&
            !dropdown.contains(event.target) &&
            !userButton.contains(event.target)
        ) {
            showDropdown = false;
        }
    };

    const checkStoreStatus = () => {
        const timeDocRef = doc(db, "time", "store");
        
        onSnapshot(
            timeDocRef,
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const { openingTime, closingTime } = docSnapshot.data();

                    const currentTime = new Date();
                    const [openHour, openMinute] = openingTime
                        .split(":")
                        .map(Number);
                    const [closeHour, closeMinute] = closingTime
                        .split(":")
                        .map(Number);

                    const openTime = new Date();
                    openTime.setHours(openHour, openMinute, 0);

                    const closeTime = new Date();
                    closeTime.setHours(closeHour, closeMinute, 0);

                    const timeDiff =
                        (closeTime - currentTime) / (1000 * 60 * 60);

                    const formatTime = (time) => {
                        const hours = time.getHours();
                        const minutes = time
                            .getMinutes()
                            .toString()
                            .padStart(2, "0");
                        const period = hours >= 12 ? "PM" : "AM";
                        const displayHour = ((hours + 11) % 12) + 1;
                        return `${displayHour}:${minutes} ${period}`;
                    };

                    let checkInterval = null;
                    
                    if (currentTime >= openTime && currentTime <= closeTime) {
                        storeOpen.set(true);

                        if (timeDiff <= 1) {
                            timeMessage = `Closing at ${formatTime(closeTime)}`;

                            checkInterval = setInterval(checkStoreStatus, 90000)
                        } else {
                            timeMessage = null;

                            if (checkInterval) clearInterval(checkInterval);
                        }
                    } else {
                        storeOpen.set(false);

                        const isToday = currentTime < openTime;
                        const dayMessage = isToday ? "today" : "tomorrow";

                        timeMessage = `Closed. Opening ${dayMessage} at ${formatTime(openTime)}`;

                        if (checkInterval) clearInterval(checkInterval);
                    }
                }
            },
            (error) => {
                console.error("Error listening to store time updates:", error);
            },
        );
    };

    onMount(async () => {
        if (browser) window.addEventListener("click", handleOutsideClick);

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
                sAuthStore.user.displayName = sAuthStore.user.displayName
                    ? sAuthStore.user.displayName
                    : sAuthStore.user.email
                      ? sAuthStore.user.email.split("@")[0].substring(0, 7)
                      : "there";

                checkPhoneNumber(currentUser.uid);
            } else {
                sAuthStore.loggedIn = false;
                sAuthStore.user = null;
            }
        });

        checkStoreStatus();
    });

    onDestroy(() => {
        if (browser) window.removeEventListener("click", handleOutsideClick);
    });
</script>

{#if timeMessage}
    <div class="store-messages">
        <strong>{timeMessage}</strong>
    </div>
{/if}

<div class="header">
    <div class="header-left">
        <h1 on:click={() => goto(`/`)}>Chitto<span>Pasal</span></h1>
        {#if sUserLocation.place}
            <div
                class="header-delivery-location"
                on:click={() => (showLocationPopup = true)}
            >
                <div class="bold-delivery-location">
                    {#if !sStoreOpen && timeMessage}
                        Delivery in - minutes
                    {:else}
                        Delivery in {sUserLocation.deliveryTime} minutes
                    {/if}
                </div>
                <div class="header-location">
                    <div class="header-location-txt">{sUserLocation.place}</div>
                    <i class="fa-solid fa-chevron-down"></i>
                </div>
            </div>
        {:else}
            <div
                class="header-delivery-location"
                on:click={() => (showLocationPopup = true)}
            >
                Delivery Location <i class="fa-solid fa-chevron-down"></i>
            </div>
        {/if}
    </div>

    <div class="header-mid">
        <div class="header-search">
            <input
                type="text"
                placeholder={`Search ${searchHolder}`}
                bind:value={searchQuery}
                on:keydown={handleKeydown}
            />
            <i on:click={handleSearch} class="fa-solid fa-search"></i>
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
                Hi, <span>{sAuthStore.user.displayName}</span>
                <i class="fa-solid fa-chevron-down"></i>
            </div>
            {#if showDropdown}
                <div class="dropdown">
                    {#if phoneNumber}
                        <div class="dropdown-item">
                            <i class="fa-solid fa-phone"></i>
                            <span class="phoneno">{phoneNumber}</span>
                            <i
                                class="fa-regular fa-pen-to-square"
                                on:click={() => (showPhoneInputPopup = true)}
                            ></i>
                        </div>
                    {:else}
                        <div
                            class="dropdown-item"
                            on:click={() => (showPhoneInputPopup = true)}
                        >
                            <i class="fa-solid fa-phone"></i>
                            Add Phone Number
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
    <div
        class="popup-overlay"
        on:click={() => {
            showLocationPopup = !sUserLocation.coords.length > 0;
        }}
    ></div>
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
        <div class="add-edit-phone">
            <h3>{phoneNumber ? "Edit Phone Number" : "Add Phone Number"}</h3>
            <input
                type="text"
                bind:value={newPhoneNumber}
                placeholder="Enter new phone number"
            />
            <button on:click={savePhoneNumber}>Save</button>
        </div>
    </div>
{/if}

<style>
    .header {
        padding: 1rem 2rem;
        background-color: #fff;
        /* background: linear-gradient(90deg, #a8e6cf, #dcedf7); */
        background: linear-gradient(#a8e6cf, #fff);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .header-left,
    .header-right {
        display: flex;
        align-items: center;
        gap: 2rem;
    }

    .header-left h1 {
        font-size: 1.75rem;
        color: var(--blue);
    }

    .header-left h1 span {
        color: var(--green);
    }

    .header-delivery-location {
        padding: 0.5rem 1rem;
        font-weight: bold;
        background-color: #fff;
        border: 1px solid #f1f1f1;
        border-radius: 7px;
        cursor: pointer;
    }

    .header-location {
        display: flex;
        align-items: center;
    }

    .header-location-txt {
        margin-right: 0.25rem;
        width: auto;
        max-width: 200px;
        font-size: 0.8rem;
        color: #797979;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .header-search {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .header-search input {
        padding: 0 1rem;
        width: 650px;
        height: 45px;
        font-weight: bold;
        background-color: #fff;
        border: 1px solid #dcdcdc;
        border-right: none;
        border-radius: 7px;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        outline: none;
    }

    .header-search input::placeholder {
        color: #888;
        font-size: 0.9rem;
        font-style: italic;
        font-weight: bold;
    }

    .header-search i {
        padding: 0 1rem;
        height: 45px;
        color: #888;
        background-color: #fff;
        border: 1px solid #dcdcdc;
        border-left: none;
        border-radius: 7px;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    }

    .header-right {
        position: relative;
    }

    .header-login,
    .header-user {
        padding: 0.5rem 1rem;
        background-color: #d3ea27;
        color: #797979;
        border-radius: 7px;
        cursor: pointer;
    }

    .header-user span {
        color: #000;
    }

    .header-user i {
        margin-left: 0.25rem;
    }

    .header-cart {
        position: relative;
        cursor: pointer;
    }

    .header-cart i {
        font-size: 1.25rem;
    }

    .header-cart span {
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--green);
        position: absolute;
        top: -0.75rem;
        right: -0.8rem;
    }

    .dropdown {
        width: max-content;
        position: absolute;
        top: 35px;
        right: 3.25rem;
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

    .dropdown .phoneno {
        margin: 0 2rem 0 0.5rem;
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
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        z-index: 101;
    }

    .add-edit-phone {
        padding: 2rem;
        width: 400px;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    .add-edit-phone h3 {
        margin-bottom: 0.5rem;
    }

    .add-edit-phone button {
        margin: 0.25rem 0;
        padding: 0.5rem 1rem;
        width: 250px;
        height: 40px;
        background-color: var(--blue);
        color: white;
        border: none;
        cursor: pointer;
        border-radius: 5px;
    }

    .add-edit-phone button:hover {
        background-color: #0056b3;
    }

    .fa-phone {
        margin-right: 0.5rem;
    }

    .store-messages {
        padding: 1rem 0 0;
        text-align: center;
        color: #000;
        background-color: #a8e6cf;
    }

    .popup-container input {
        width: 100%;
        margin-bottom: 1rem;
        padding: 0.75rem;
        border: 1px solid #dcdcdc;
        border-radius: 4px;
    }

    /* media queries */
    @media (max-width: 1400px) {
        .header {
            padding: 1rem;
        }
    }
    @media (max-width: 1375px) {
        .header-search input {
            width: 500px;
        }
    }
    @media (max-width: 1200px) {
        .header-left,
        .header-right {
            gap: 1rem;
        }
        .header-search input {
            width: 400px;
        }
        .dropdown {
            right: 2.25rem;
        }
    }
    @media (max-width: 1075px) {
        .header-left h1 {
            display: none;
        }
        .header-cart {
            width: 55px;
            height: 50px;
            background-color: #fff;
            border: 1px solid #dcdcdc;
            border-radius: 7px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: fixed;
            bottom: 1.5rem;
            right: 1.5rem;
            z-index: 100;
            background: linear-gradient(90deg, #a8e6cf, #dcedf7);
            background-size: 400% 400%;
            animation: gradient 7s ease infinite;
        }
        .header-cart i {
            color: rgba(0, 0, 0, 0.8);
        }
        .header-cart span {
            top: 5px;
            right: 5px;
        }
        .dropdown {
            right: 0;
        }

        @keyframes gradient {
            0% {
                background-position: 0% 50%;
            }
            50% {
                background-position: 100% 50%;
            }
            100% {
                background-position: 0% 50%;
            }
        }
    }
    @media (max-width: 825px) {
        .header {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto;
            grid-template-areas:
                "item1 item3"
                "item2 item2";
            gap: 1rem;
        }
        .header-left {
            grid-area: item1;
        }
        .header-mid {
            grid-area: item2;
        }
        .header-right {
            grid-area: item3;
            display: flex;
            justify-content: end;
        }
        .header-search input {
            width: 100%;
        }
        .dropdown {
            top: 35px;
            right: 0px;
        }
    }
    @media (max-width: 450px) {
        .header-location-txt {
            max-width: 175px;
            font-size: 0.7rem;
        }
    }
</style>
