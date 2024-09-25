<script>
    import { userLocation, cartProducts, showCart } from "$lib/store";
    import LocationPopup from './LocationPopup.svelte'; 
    import { goto } from '$app/navigation'; 

    let sUserLocation = {};
    let sCartProductsCount = 0;
    let sShowCart = false;
    let showLocationPopup = false;
    let searchQuery = ""; 

    userLocation.subscribe(value => {
        sUserLocation = value;

        setTimeout(() => {
            showLocationPopup = sUserLocation.coords.length == 0
        }, 1500)
    });

    cartProducts.subscribe(value => {
        sCartProductsCount = value.length;
    });

    showCart.subscribe(value => { 
        sShowCart = value;
    });

    const toggleCart = () => {
        showCart.set(true);
    };

    const toggleLocationPopup = () => {
        showLocationPopup = !showLocationPopup; 
    };

    const handleKeydown = (event) => {
        if (event.key === 'Enter' && searchQuery.trim() !== "") {
            goto(`/search?query=${encodeURIComponent(searchQuery)}`);
        }
    };
</script>

<div class="header">
    <div class="header-left">
        <h1>OnlineMart</h1>
        {#if sUserLocation.place}
        <div class="header-delivery-location" on:click={toggleLocationPopup}>
            <div class="bold-delivery-location">Delivery in {sUserLocation.deliveryTime} minutes</div>
            <div class="header-location">
                <div class="header-location-txt">{sUserLocation.place}</div>
                <i class="fa-solid fa-chevron-down"></i>
            </div>
        </div>
        {:else}
        <div class="header-delivery-location" on:click={toggleLocationPopup}>
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
        <div class="header-login">Login</div>
        <div class="header-cart" on:click={toggleCart}>
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

<style>
    .header{
        padding: 1rem 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #dcdcdc;
    }
    .header-left, .header-right{
        display: flex;
        align-items: center;
    }
    .header-left h1{
        margin-right: 2rem;
    }
    .header-delivery-location{
        cursor: pointer;
    }

    .header-location{
        display: flex;
        align-items: center;
    }

    .bold-delivery-location{
        font-weight: bold;
    }
    
    .header-location-txt{
        width: 250px;
        font-size: .9rem;
        color: #797979;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .header-location i{
        margin-left: -1rem;
    }
    
    .header-search input{
        padding: 0 1rem;
        width: 700px;
        height: 40px;
        border: 1px solid #dcdcdc;
        border-radius: 3px;
        outline: none;
    }
    .header-login{
        margin: 0 2rem;
    }
    .header-cart{
        position: relative;
        cursor: pointer;
    }
    .header-cart span{
        font-size: .8rem;
        position: absolute;
        top: -.5rem;
        right: -.75rem;
    }

    .popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1; 
    }

    .popup-container {
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translate(-50%, -20%);
        z-index: 2;
        background-color: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
</style>
