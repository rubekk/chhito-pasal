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
                collection(db, "featuredProducts"),
            );
            const featuredProductIds = featuredProductsSnapshot.docs.map(
                (doc) => doc.data().productId,
            );

            const productPromises = featuredProductIds.map((id) =>
                getDoc(doc(db, "products", id)),
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
        <h3>Tihar Special</h3>

        {#if loadingFeatured}
            <p>Loading featured products...</p>
        {:else}
            <div
                class="products-container"
            >
                {#each sFeaturedProductsData as productData}
                    <Product {productData} />
                {/each}
                {#each sFeaturedProductsData as productData}
                    <Product {productData} />
                {/each}
                {#each sFeaturedProductsData as productData}
                    <Product {productData} />
                {/each}
            </div>
        {/if}
    </div>
</section>

<style>
    .tihar-special {
        margin: 2rem auto;
        width: 100%;
        height: 100%;
    }

    .content {
        z-index: 1;
    }

    .content h3 {
        margin: 0 0 1rem .5rem;
    }
    
    .products-container {
        margin: 1rem auto;
        display: flex;
        flex-wrap: wrap;
        gap: .75rem;
    }
</style>
