<script>
    import "./app.css";
    import Header from "../components/Header.svelte";
    import Product from "../components/Product.svelte";
    import Cart from "../components/Cart.svelte";
    import LocationPopup from "../components/LocationPopup.svelte";
    import { productsData, showCart } from "$lib/store";

    let sProductsData= [];
    let sShowLocationPopup= false;
    let sShowCart= false;

    productsData.subscribe(value =>{
        sProductsData= value
    })
    showCart.subscribe(value =>{
        sShowCart=value
    })
</script>

<Header />
<div class="products-container">
    {#each sProductsData as productData}
    <Product productData={productData} />
    {/each}
</div>
{#if sShowLocationPopup}
<div class="location-popup-container">
    <LocationPopup />
</div>
{/if}
{#if sShowCart}
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