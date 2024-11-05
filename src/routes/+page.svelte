<script>
    import "./app.css";
    import { onMount } from "svelte";
    import Product from "../components/Product.svelte";
    import Category from "../components/Category.svelte";
    import { featuredProductsData, dailyEssentialsData, categories } from "$lib/store";
    import { db } from "$lib/firebaseConfig";
    import {
        collection,
        getDocs,
        doc,
        getDoc
    } from "firebase/firestore";
    import Footer from "../components/Footer.svelte";

    let sFeaturedProductsData = [];
    let sDailyEssentialsData = [];
    let productsContainer;
    let dailyEssentialsContainer;
    let showLeftButtonFeatured = false;
    let showRightButtonFeatured = false;
    let showLeftButtonEssentials = false;
    let showRightButtonEssentials = false;
    let loadingFeatured = true;
    let loadingEssentials = true;  

    featuredProductsData.subscribe(value => {
        sFeaturedProductsData = value
    })
    dailyEssentialsData.subscribe(value => {
        sDailyEssentialsData = value
    })

    const getFeaturedProducts = async () => {
        if(sFeaturedProductsData.length === 7) {
            loadingFeatured = false;
            return;
        }

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

            featuredProductsData.set([...sFeaturedProductsData]);
        } catch (error) {
            console.error("Error fetching featured products:", error);
        } finally {
            loadingFeatured = false;
        }
    };

    const getDailyEssentials = async () => {
        if(sDailyEssentialsData.length === 7) {
            loadingEssentials = false;
            return;
        }

        loadingEssentials = true;
        try {
            const dailyEssentialsSnapshot = await getDocs(
                collection(db, "dailyEssentials"),
            );
            const dailyEssentialProductIds = dailyEssentialsSnapshot.docs.map(
                (doc) => doc.data().productId,
            );

            const productPromises = dailyEssentialProductIds.map((id) =>
                getDoc(doc(db, "products", id)),
            );
            const productDocs = await Promise.all(productPromises);

            sDailyEssentialsData = productDocs
                .filter((doc) => doc.exists())
                .map((doc) => ({ id: doc.id, ...doc.data() }));

            dailyEssentialsData.set([...sDailyEssentialsData]);
        } catch (error) {
            console.error("Error fetching daily essentials:", error);
        } finally {
            loadingEssentials = false;
        }
    };

    const checkScrollButtons = () => {
        if (productsContainer) {
            showLeftButtonFeatured = productsContainer.scrollLeft > 0;
            showRightButtonFeatured =
                productsContainer.scrollLeft <
                productsContainer.scrollWidth - productsContainer.clientWidth;
        }
        if (dailyEssentialsContainer) {
            showLeftButtonEssentials = dailyEssentialsContainer.scrollLeft > 0;
            showRightButtonEssentials =
                dailyEssentialsContainer.scrollLeft <
                dailyEssentialsContainer.scrollWidth -
                    dailyEssentialsContainer.clientWidth;
        }
    };

    const scrollLeftFeatured = () => {
        if (productsContainer) {
            productsContainer.scrollBy({ left: -200, behavior: "smooth" });
            checkScrollButtons();
        }
    };

    const scrollRightFeatured = () => {
        if (productsContainer) {
            productsContainer.scrollBy({ left: 200, behavior: "smooth" });
            checkScrollButtons();
        }
    };

    const scrollLeftEssentials = () => {
        if (dailyEssentialsContainer) {
            dailyEssentialsContainer.scrollBy({
                left: -200,
                behavior: "smooth",
            });
            checkScrollButtons();
        }
    };

    const scrollRightEssentials = () => {
        if (dailyEssentialsContainer) {
            dailyEssentialsContainer.scrollBy({
                left: 200,
                behavior: "smooth",
            });
            checkScrollButtons();
        }
    };

    onMount(() => {
        getFeaturedProducts();
        getDailyEssentials();
        checkScrollButtons();
    });
</script>

<div class="products-wrapper">
    <h3>Featured Products</h3>
    {#if loadingFeatured}
        <p>Loading featured products...</p>
    {:else}
        <div
            class="products-container"
            bind:this={productsContainer}
            on:scroll={checkScrollButtons}
        >
            {#each sFeaturedProductsData as productData}
                <Product {productData} />
            {/each}
        </div>
        {#if showLeftButtonFeatured}
            <button
                class="scroll-button scroll-left"
                on:click={scrollLeftFeatured}
            >
                <i class="fa-solid fa-chevron-left"></i>
            </button>
        {/if}
        {#if showRightButtonFeatured}
            <button
                class="scroll-button scroll-right"
                on:click={scrollRightFeatured}
            >
                <i class="fa-solid fa-chevron-right"></i>
            </button>
        {/if}
    {/if}
</div>

<div class="categories-wrapper">
    <h3>Categories</h3>
    <div class="categories-container">
        {#each categories as category}
            <Category {category} />
        {/each}
    </div>
</div>

<div class="daily-essentials-wrapper">
    <h3>Daily Essentials</h3>
    {#if loadingEssentials}
        <p>Loading daily essentials...</p>
    {:else}
        <div
            class="products-container"
            bind:this={dailyEssentialsContainer}
            on:scroll={checkScrollButtons}
        >
            {#each sDailyEssentialsData as productData}
                <Product {productData} />
            {/each}
        </div>
        {#if showLeftButtonEssentials}
            <button
                class="scroll-button scroll-left"
                on:click={scrollLeftEssentials}
            >
                <i class="fa-solid fa-chevron-left"></i>
            </button>
        {/if}
        {#if showRightButtonEssentials}
            <button
                class="scroll-button scroll-right"
                on:click={scrollRightEssentials}
            >
                <i class="fa-solid fa-chevron-right"></i>
            </button>
        {/if}
    {/if}
</div>

<div class="footer">
    <Footer />
</div>

<style>
    .products-wrapper,
    .daily-essentials-wrapper,
    .categories-wrapper {
        padding: 1rem 0;
        width: 100%;
        position: relative;
    }

    .products-wrapper {
        padding: 0 0 1rem 0;
    }

    .products-wrapper h3,
    .categories-wrapper h3,
    .daily-essentials-wrapper h3 {
        margin: 0 0 .5rem 0.5rem;
    }

    .products-container,
    .categories-container {
        margin: auto;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-wrap: nowrap;
        gap: 0.75rem;
        overflow-x: auto;
        overflow-y: hidden;
        scrollbar-width: none;
    }

    .categories-container {
        flex-wrap: wrap;
    }

    .scroll-button {
        height: 40px;
        width: 40px;
        color: #000;
        background-color: #fff;
        border: 1px solid #eaeaea;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;
        z-index: 1;
    }

    .scroll-left {
        left: 5px;
    }

    .scroll-right {
        right: 5px;
    }

    .products-container::-webkit-scrollbar {
        display: none;
    }

    @media (max-width: 800px) {
        .products-wrapper,
        .categories-wrapper,
        .daily-essentials-wrapper {
            padding: 1rem .5rem;
        }
        .products-wrapper {
            padding: 0 .5rem 1rem;
        }
        .categories-container {
            justify-content: center;
        }
    }
    @media (max-width: 700px) {
        .products-container,
        .categories-container {
            gap: 0.5rem;
        }
    }
</style>
