<script>
    import "./app.css";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import Product from "../components/Product.svelte";
    import Category from "../components/Category.svelte";
    import { productsData, categories } from "$lib/store";
    import { db } from "$lib/firebaseConfig";
    import {
        collection,
        getDocs,
        doc,
        getDoc,
        onSnapshot,
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

    const getDailyEssentials = async () => {
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
        } catch (error) {
            console.error("Error fetching daily essentials:", error);
        } finally {
            loadingEssentials = false;
        }
    };

    const listenToFeaturedProductChanges = () => {
        const featuredProductsRef = collection(db, "featuredProducts");

        onSnapshot(featuredProductsRef, async (querySnapshot) => {
            const featuredProductIds = querySnapshot.docs.map(
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
        });
    };

    const listenToDailyEssentialsChanges = () => {
        const dailyEssentialsRef = collection(db, "dailyEssentials");

        onSnapshot(dailyEssentialsRef, async (querySnapshot) => {
            const dailyEssentialProductIds = querySnapshot.docs.map(
                (doc) => doc.data().productId,
            );
            const productPromises = dailyEssentialProductIds.map((id) =>
                getDoc(doc(db, "products", id)),
            );
            const productDocs = await Promise.all(productPromises);

            sDailyEssentialsData = productDocs
                .filter((doc) => doc.exists())
                .map((doc) => ({ id: doc.id, ...doc.data() }));
        });
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
        listenToFeaturedProductChanges();
        listenToDailyEssentialsChanges();
        checkScrollButtons();
    });
</script>

<div class="view-tihar-button-container">
    <button class="view-tihar-button" on:click={() => goto("/tihar")}
        >View Tihar Special Products</button
    >
</div>

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
    .view-tihar-button-container {
        display: flex;
        justify-content: center;
        margin: 2rem 0 0;
    }

    .view-tihar-button {
        background-color: #d14719;
        color: #fff;
        font-size: 1rem;
        font-weight: bold;
        padding: 1rem 1.5rem;
        border: 3px solid transparent;
        border-radius: 8px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition:
            color 0.3s,
            border-color 0.3s;
    }

    .view-tihar-button::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 8px;
        border: 5px solid;
        border-image: linear-gradient(45deg, #ff6b6b, #ffd93d, #ff6b6b) 1;
        animation: border-animation 1.5s linear infinite;
        z-index: 0;
    }

    @keyframes border-animation {
        0% {
            border-image-source: linear-gradient(
                45deg,
                #ff6b6b,
                #ffd93d,
                #ff6b6b
            );
        }
        25% {
            border-image-source: linear-gradient(
                45deg,
                #ffd93d,
                #ff6b6b,
                #ffd93d
            );
        }
        50% {
            border-image-source: linear-gradient(
                45deg,
                #ff6b6b,
                #ffd93d,
                #ff6b6b
            );
        }
        75% {
            border-image-source: linear-gradient(
                45deg,
                #ffd93d,
                #ff6b6b,
                #ffd93d
            );
        }
        100% {
            border-image-source: linear-gradient(
                45deg,
                #ff6b6b,
                #ffd93d,
                #ff6b6b
            );
        }
    }

    .view-tihar-button {
        position: relative;
        z-index: 1;
    }

    .products-wrapper,
    .daily-essentials-wrapper {
        padding: 2rem 0;
        width: 100%;
        position: relative;
    }

    .products-wrapper h3,
    .categories-wrapper h3,
    .daily-essentials-wrapper h3 {
        margin: 0 0 1rem 0.5rem;
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

    .categories-wrapper {
        padding: 2rem 0;
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
            padding: 2rem 1rem;
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
