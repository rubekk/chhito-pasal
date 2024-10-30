<script>
    import { onMount } from "svelte";
    import Product from "./../../components/Product.svelte";
    import { productsData, showCart, cartProducts } from "$lib/store";
    import { db } from "$lib/firebaseConfig";
    import {
        collection,
        getDocs,
        doc,
        getDoc
    } from "firebase/firestore";
    import { goto } from "$app/navigation";

    let sFeaturedProductsData = [];
    let loadingFeatured = true;
    let sCartProductsCount = 0;

    cartProducts.subscribe((value) => {
        sCartProductsCount = value.length;
    });


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
    <div class="back-btn" on:click={() => goto("/")}>
        <i class="fa-solid fa-arrow-left"></i>
        Back
    </div>
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

<div class="page-cart" on:click={() => showCart.set(true)}>
    <i class="fa-solid fa-cart-shopping"></i>
    {#if sCartProductsCount > 0}
        <span>{sCartProductsCount}</span>
    {/if}
</div>

<style>
    .tihar-special {
        margin: 1rem auto;
        padding: 2rem 1rem;
        width: 100%;
        background: linear-gradient(145deg, #ffefc2, #fff3e0);
        text-align: center;
        color: #d14719; 
        position: relative;
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
        margin: 2rem 0 1rem;
        font-size: 1.2rem;
        color: #f4a261;
        display: block;
        text-align: center;
    }

    .back-btn {
        font-size: 1.1rem;
        display: none;
        align-items: center;
        position: absolute;
        top: 1rem;
        left: 2rem;
        cursor: pointer;
    }
    
    .back-btn i {
        margin-right: 1rem;
        font-size: 1.25rem;
    }

    .page-cart {
        width: 55px;
        height: 50px;
        background-color: #fff;
        border: 1px solid #dcdcdc;
        border-radius: 7px;
        display: none;
        align-items: center;
        justify-content: center;
        position: fixed;
        bottom: 1.5rem;
        right: 1.5rem;
        z-index: 100;
        background: linear-gradient(90deg, #a8e6cf, #dcedf7);
        background-size: 400% 400%;
        animation: gradient 7s ease infinite;
        cursor: pointer;
    }

    .page-cart i {
        font-size: 1.25rem;
        color: rgba(0, 0, 0, 0.8);
    }

    .page-cart span {
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--green);
        position: absolute;
        top: 5px;
        right: 5px;
    }

    /* media queries */
    @media (max-width: 1200px) {
        .tihar-special {
            margin: 0;
        }
        .back-btn {
            display: flex;
        }
        .page-cart {
            display: flex;
        }
    }
</style>
