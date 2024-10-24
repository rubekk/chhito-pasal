<script>
    import "./../app.css";
    import Product from "./../../components/Product.svelte";
    import { onMount } from "svelte";
    import { showCart, productsData, cartProducts } from "$lib/store";
    import { goto } from '$app/navigation';
    import { page } from "$app/stores"; 
    import { db } from "$lib/firebaseConfig";
    import { collection, getDocs, onSnapshot } from "firebase/firestore";

    let sProductsData = [];
    let searchQuery = "";
    let filteredProducts = [];
    let sCartProductsCount = 0;

    productsData.subscribe(value => {
        sProductsData = value;
    });
    cartProducts.subscribe((value) => {
        sCartProductsCount = value.length;
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
    });

    $: {
        searchQuery = $page.url.searchParams.get("query") || "";
        
        if (sProductsData.length > 0) {
            filteredProducts = sProductsData.filter(product => {
                return product.productName.toLowerCase().includes(searchQuery.toLowerCase());
            });
        } else {
            filteredProducts = [];
        }
    }
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
        <p class="no-results">No results found for "{searchQuery}"</p>
    {/if}
</div>

<div class="page-cart" on:click={() => showCart.set(true)}>
    <i class="fa-solid fa-cart-shopping"></i>
    {#if sCartProductsCount > 0}
        <span>{sCartProductsCount}</span>
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
        margin: 2rem 0;
        text-align: center;
        color: #ff0000;
        font-weight: bold;
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
        .page-cart {
            display: flex;
        }
    }
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
