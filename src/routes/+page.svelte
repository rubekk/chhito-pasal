<script>
    import "./app.css";
    import Header from "../components/Header.svelte";
    import Product from "../components/Product.svelte";
    import Cart from "../components/Cart.svelte";
    import { productsData } from "$lib/store";

    let sProductsData= [];

    productsData.subscribe(value =>{
        sProductsData= value
    })
</script>

<Header />
<div class="products-container">
    {#each sProductsData as productData}
    <Product productData={productData} />
    {/each}
</div>
<Cart />

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
</style>