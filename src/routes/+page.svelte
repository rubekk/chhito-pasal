<script>
    import "./app.css";
    import { onMount } from "svelte";
    import Product from "../components/Product.svelte";
    import Category from "../components/Category.svelte";
    import { productsData, categories } from "$lib/store";
    import { db } from "$lib/firebaseConfig";
    import { collection, getDocs, onSnapshot } from "firebase/firestore";

    let sProductsData = [];
    let productsContainer;
    let showLeftButton = false;
    let showRightButton = false;

    productsData.subscribe((value) => {
        sProductsData = value;
    });

    const getAllProducts = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "products"));
            sProductsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            productsData.set(sProductsData);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const listenToProductChanges = () => {
        const productsRef = collection(db, "products");

        onSnapshot(productsRef, (querySnapshot) => {
            querySnapshot.docChanges().forEach((change) => {
                const updatedData = change.doc.data();

                if (change.type === "modified") {
                    const index = sProductsData.findIndex(
                        (product) => product.id === change.doc.id,
                    );

                    if (index !== -1) {
                        sProductsData[index] = {
                            ...sProductsData[index],
                            stock: updatedData.stock,
                            price: updatedData.price,
                            discountedPrice: updatedData.discountedPrice,
                        };

                        productsData.set([...sProductsData]);
                    }
                }
            });
        });
    };

    onMount(() => {
        getAllProducts();
        listenToProductChanges();
        checkScrollButtons();
    });

    const checkScrollButtons = () => {
        if (productsContainer) {
            showLeftButton = productsContainer.scrollLeft > 0;
            showRightButton = productsContainer.scrollLeft < productsContainer.scrollWidth - productsContainer.clientWidth;
        }
    };

    const scrollLeft = () => {
        if (productsContainer) {
            productsContainer.scrollBy({ left: -200, behavior: 'smooth' });
            checkScrollButtons(); // Update button visibility after scrolling
        }
    };

    const scrollRight = () => {
        if (productsContainer) {
            productsContainer.scrollBy({ left: 200, behavior: 'smooth' });
            checkScrollButtons(); // Update button visibility after scrolling
        }
    };
</script>

<div class="products-wrapper">
    <h3>Featured Products</h3>
    <div class="products-container" bind:this={productsContainer} on:scroll={checkScrollButtons}>
        {#each sProductsData as productData}
            <Product {productData} />
        {/each}
    </div>
    {#if showLeftButton}
        <button class="scroll-button scroll-left" on:click={scrollLeft}>
            <i class="fa-solid fa-chevron-left"></i>
        </button>
    {/if}
    {#if showRightButton}
        <button class="scroll-button scroll-right" on:click={scrollRight}>
            <i class="fa-solid fa-chevron-right"></i>
        </button>
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

<style>
    .products-wrapper {
        padding: 2rem 0;
        width: 100%;
        position: relative; 
    }

    .products-wrapper h3, .categories-wrapper h3 {
        margin: 0 0 1rem .5rem;
    }

    .products-container, .categories-container {
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

    /* media queries */
    @media(max-width: 800px) {
        .products-wrapper, .categories-wrapper {
            padding: 2rem 1rem;
        }
        .categories-container {
            justify-content: center;
        }
    }
    @media(max-width: 700px) {
        .products-container, .categories-container {
            gap: .5rem;
        }
    }
</style>
