<script>
    import "./../app.css";
    import Header from "./../../components/Header.svelte";
    import Product from "./../../components/Product.svelte";
    import { productsData } from "$lib/store";
    import { goto } from '$app/navigation';
    import { page } from "$app/stores"; // For accessing the URL parameters

    let sProductsData = [];
    let searchQuery = "";
    let filteredProducts = [];

    // Subscribe to the products data
    productsData.subscribe(value => {
        sProductsData = value;
    });

    // Subscribe to the URL to get the search query
    $: searchQuery = $page.url.searchParams.get("query");

    // Perform a flexible search
    $: filteredProducts = sProductsData.filter(product => {
        return product.productName.toLowerCase().includes(searchQuery?.toLowerCase() || "");
    });

    const goBack = () => {
        goto('/'); 
    };
</script>

<Header />

<div class="search-info">
    <button on:click={goBack} class="back-button">Back</button>
    <h2>Showing results for "{searchQuery}"</h2>
</div>

<div class="products-container">
    {#each filteredProducts as productData}
    <Product productData={productData} />
    {/each}
</div>

{#if filteredProducts.length === 0}
    <p>No results found for "{searchQuery}".</p>
{/if}

<style>
    .search-info {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        margin: 2rem 0;
    }
    .back-button {
        padding: 0.5rem 1rem;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }
    .back-button:hover {
        background-color: #0056b3;
    }
    .products-container {
        padding: 2rem 1rem;
        margin: auto;
        max-width: 1000px;
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 1rem;
    }
</style>
