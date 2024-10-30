<script>
    import { onMount } from "svelte";
    import Product from "./../../components/Product.svelte";
    import { productsData } from "$lib/store";
    import { db } from "$lib/firebaseConfig";
    import {
        collection,
        getDocs,
        doc,
        getDoc
    } from "firebase/firestore";

    let sFeaturedProductsData = [];
    let loadingFeatured = true;

    const getFeaturedProducts = async () => {
        loadingFeatured = true;
        try {
            const featuredProductsSnapshot = await getDocs(
                collection(db, "featuredProducts")
            );
            const featuredProductIds = featuredProductsSnapshot.docs.map(
                (doc) => doc.data().productId
            );

            const productPromises = featuredProductIds.map((id) =>
                getDoc(doc(db, "products", id))
            );
            const productDocs = await Promise.all(productPromises);

            sFeaturedProductsData = productDocs
                .filter((doc) => doc.exists())
                .map((doc) => ({ id: doc.id, ...doc.data() }));

            productsData.set(sFeaturedProductsData);
        } catch (error) {
            console.error("Error fetching featured products:", error);
        } finally {
            loadingFeatured = false;
        }
    };

    onMount(() => {
        getFeaturedProducts();
    });
</script>

<section class="tihar-special">
    <div class="content">
        <h3>🌼 Tihar Special Products 🌼</h3>
        <p class="subtitle">Celebrate with our special deals!</p>

        {#if loadingFeatured}
            <p class="loading-text">Loading products...</p>
        {:else}
            <div class="products-container">
                {#each sFeaturedProductsData as productData}
                    <Product {productData} />
                {/each}
            </div>
        {/if}
    </div>
</section>

<style>
    .tihar-special {
        margin: 1rem auto;
        padding: 2rem 1rem;
        width: 100%;
        background: linear-gradient(145deg, #ffefc2, #fff3e0);
        text-align: center;
        color: #d14719; 
        font-family: 'Poppins', sans-serif;
    }

    .content {
        max-width: 1200px;
        margin: 0 auto;
        z-index: 1;
    }

    .content h3 {
        font-size: 1.8rem;
        color: #d14719;
        margin-bottom: 0.5rem;
        font-weight: bold;
    }

    .subtitle {
        font-size: 1.1rem;
        color: #b56020;
        margin-bottom: 1.5rem;
        font-weight: 500;
    }

    .loading-text {
        color: #b56020;
        font-weight: bold;
    }
    
    .products-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 1rem;
        padding: 1rem 0;
    }

    .tihar-special::before,
    .tihar-special::after {
        content: "🌼 🌼 🌼 🌼 🌼 🌼 🌼 🌼 🌼 🌼 🌼";
        margin: 1rem 0;
        font-size: 1.2rem;
        color: #f4a261;
        display: block;
        text-align: center;
    }
</style>
