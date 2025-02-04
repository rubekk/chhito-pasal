<script>
    import { onMount } from "svelte";
    import { cartProducts } from "$lib/store";

    export let productData = {
        productId: crypto.randomUUID(),
        productName: "Product name",
        price: 100,
        discountedPrice: null, 
        stock: 0,
        imageUrl: "",
    };

    let sCartProducts = [];
    let productInCart = false;
    let cartProduct = null;
    let discountPercentage = null;

    cartProducts.subscribe((value) => {
        sCartProducts = value;
        cartProduct = sCartProducts.find(
            (product) => product.id === productData.id,
        );
        productInCart = cartProduct;
    });

    const calculateDiscountPercent = () => {
        if (
            productData.discountedPrice &&
            productData.price > productData.discountedPrice
        ) {
            discountPercentage = Math.round(
                ((productData.price - productData.discountedPrice) /
                productData.price) *
                100,
            );
        }
    }

    const handleAddClick = () => {
        if (sCartProducts.some((product) => product.id === productData.id))
            return;

        let newProduct = {
            ...productData,
            count: 1,
            totalPrice: productData.discountedPrice || productData.price,
        };

        cartProducts.set([...sCartProducts, newProduct]);
    };

    const handleCartMinus = () => {
        let i = sCartProducts.findIndex(
            (product) => product.id === productData.id,
        );
        if (i < 0) return;

        if (sCartProducts[i].count > 0) {
            sCartProducts[i].count--;
            sCartProducts[i].totalPrice =
                sCartProducts[i].count *
                (productData.discountedPrice || sCartProducts[i].price);
        }
        if (sCartProducts[i].count === 0) sCartProducts.splice(i, 1);

        cartProducts.set([...sCartProducts]);
    };

    const handleCartPlus = () => {
        let i = sCartProducts.findIndex(
            (product) => product.id === productData.id,
        );
        if (i < 0) return;

        if (sCartProducts[i].count >= productData.stock) {
            sCartProducts[i].count = productData.stock;
            cartProducts.set([...sCartProducts]);
            return;
        }

        sCartProducts[i].count++;
        sCartProducts[i].totalPrice =
            sCartProducts[i].count *
            (productData.discountedPrice || sCartProducts[i].price);

        cartProducts.set([...sCartProducts]);
    };

    onMount(() => {
        calculateDiscountPercent();
    })
</script>

<div class="product">
    {#if discountPercentage}
        <div class="discount-badge">{discountPercentage}% OFF</div>
    {/if}
    <img class="product-img" src={`/products/${productData.imageUrl}.jpg`} alt={productData.productName}>
    <div class="product-text">
        <div class="product-name">{productData.productName}</div>
        <div class="product-text-below">
            {#if !productInCart && productData.stock > 0}
                <div class="product-add-btn" on:click={handleAddClick}>Add</div>
            {:else if productData.stock <= 0}
                <span class="out-stock-txt">Out of Stock</span>
            {:else}
                <div class="cart-product-add-minus-btns">
                    <button
                        class="cart-product-minus-btn"
                        on:click={handleCartMinus}
                    >
                        <i class="fa-solid fa-minus"></i>
                    </button>
                    <div class="cart-product-count">{cartProduct?.count}</div>
                    <button
                        class="cart-product-plus-btn"
                        on:click={handleCartPlus}
                    >
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            {/if}
            <div class="product-prices">
                {#if productData.discountedPrice < productData.price}
                    <div class="discounted-price">
                        Rs. {productData.discountedPrice}
                    </div>
                    <div class="original-price">Rs. {productData.price}</div>
                {:else}
                    <div class="discounted-price">Rs. {productData.price}</div>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    .product {
        position: relative;
        height: 275px;
        min-width: 200px;
        max-width: 250px;
        background-color: #fff;
        border-radius: 8px; 
        box-shadow: rgba(0, 0, 0, 0.04) 2px 2px 8px;
        transition: box-shadow 0.3s ease; 
        flex-grow: 1;
    }

    .discount-badge {
        position: absolute;
        top: 7px;
        right: 7px;
        background-color: var(--green);
        background-color: #d3ea27;
        color: #3a3a3a;
        font-size: 0.7rem;
        padding: 0.3rem 0.6rem;
        border-radius: 5px;
        font-weight: bold;
    }

    .product-img {
        margin: .5rem auto;
        width: 140px;
        height: 140px;
        display: flex;
        object-fit: contain;
    }

    .product-text {
        margin-top: 1rem;
        padding: 0 0.5rem 0.5rem .75rem;
        font-size: 0.8rem;
        border: 4px solid #fff;
        border-bottom: none;
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
    }

    .product-name {
        height: 45px;
        font-weight: 500;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .product-text-below {
        margin-top: 1rem;
        font-size: 0.9rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .product-add-btn {
        padding: 0.25rem .75rem;
        font-size: .8rem;
        font-weight: bold;
        color: #d3ea27;
        background-color: #fff;
        border: 1px solid #d3ea27;
        border-radius: 3px;
        cursor: pointer;
    }

    .product-add-btn:hover {
        color: #fff;
        background-color: #d3ea27;
    }

    .out-stock-txt {
        font-style: italic;
        color: #e74c3c;
    }

    .cart-product-add-minus-btns {
        display: flex;
        align-items: center;
    }

    .cart-product-count {
        padding: 0.5rem;
    }

    .cart-product-minus-btn,
    .cart-product-plus-btn {
        padding: 0.4rem;
        color: #000;
        background-color: #d3ea27;
        border: none;
        border-radius: 5px;
    }

    .cart-product-minus-btn:hover,
    .cart-product-plus-btn:hover {
        color: white;
        background-color: #b1c423;
    }

    .product-prices {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
    }

    .discounted-price {
        font-size: 0.9rem;
        font-weight: 600;
        font-style: italic;
    }

    .original-price {
        text-decoration: line-through;
        font-size: 0.8rem;
        font-style: italic;
        color: #797979;
    }

    /* media queries */
    @media (max-width: 900px) {
        .product {
            min-width: 160px;
            max-width: 275px;
        }
    }
    @media (max-width: 385px) {
        .product {
            width: 160px;
            min-width: 160px;
            max-width: 160px;
        }
        .discounted-price {
            font-size: .7rem;
        }
    }
</style>
