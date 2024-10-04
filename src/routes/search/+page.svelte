<script>
    import "./../app.css";
    import Product from "./../../components/Product.svelte";
    import { productsData } from "$lib/store";
    import { goto } from '$app/navigation';
    import { page } from "$app/stores"; 

    let sProductsData = [];
    let searchQuery = "";
    let filteredProducts = [];

    productsData.subscribe(value => {
        sProductsData = value;
    });

    $: searchQuery = $page.url.searchParams.get("query");

    $: filteredProducts = sProductsData.filter(product => {
        return product.productName.toLowerCase().includes(searchQuery?.toLowerCase() || "");
    });
</script>

<div class="search-container">
    <div class="search-info">
        <button on:click={() => goto(`/`)} class="back-button">
            <i class="fa-solid fa-arrow-left"></i>
        </button>
        <h3 class="search-title">Showing results for "{searchQuery}"</h3>
    </div>

    <div class="products-container">
        {#each filteredProducts as productData}
            <Product productData={productData} />
        {/each}
    </div>

    {#if filteredProducts.length === 0}
        <p class="no-results">No results found for "{searchQuery}".</p>
    {/if}
</div>

<style>
    .search-container {
        width: 100%;
        background-color: #fff;
        border: 1px solid #cecece;
        border-top: none;
    }

    .search-info {
        display: flex;
        align-items: center;
        padding: 1rem;
        border-bottom: 2px solid var(--blue);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); 
    }

    .back-button {
        font-size: 1.25rem;
        background-color: transparent;
        border: none;
        color: var(--blue);
        cursor: pointer;
        display: flex;
        align-items: center;
    }

    .back-button i {
        margin-right: 0.5rem;
    }

    .search-title {
        font-size: 1.25rem;
        color: var(--blue);
        margin-left: 1rem;
    }

    .products-container {
        padding: 2rem 1rem;
        margin: auto;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.75rem;
    }

    .no-results {
        text-align: center;
        color: #ff0000;
        font-weight: bold;
        margin-top: 2rem;
    }

    /* media queries */
    @media(max-width: 700px) {
        .search-title {
            font-size: 1.1rem;
        }
    }
    @media(max-width: 450px) {
        .products-container {
            padding: 2rem .5rem;
            margin: auto;
            width: max-content;
        }
    }
</style>
