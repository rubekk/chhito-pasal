<script>
    import { cartProducts } from "$lib/store";

    export let productData = {
        productId: crypto.randomUUID(),
        productName: "Product name",
        price: 100,
    };

    let sCartProducts = [];
    let productInCart = false;
    let cartProduct = null;

    cartProducts.subscribe((value) => {
        sCartProducts = value;
        cartProduct = sCartProducts.find(
            (product) => product.id === productData.id,
        );
        productInCart = cartProduct;
    });

    const handleAddClick = () => {
        if (
            sCartProducts.some(
                (product) => product.id === productData.id,
            )
        ) return;

        let newProduct = {
            ...productData,
            count: 1,
            totalPrice: productData.price,
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
                sCartProducts[i].count * sCartProducts[i].price;
        }
        if (sCartProducts[i].count === 0) sCartProducts.splice(i, 1);

        cartProducts.set([...sCartProducts]);
    };

    const handleCartPlus = () => {
        console.log(productData.stock)
        let i = sCartProducts.findIndex(
            (product) => product.id === productData.id,
        );
        if (i < 0) return;
        if(sCartProducts[i].count >= productData.stock) {
            sCartProducts[i].count = productData.stock;
            cartProducts.set([...sCartProducts]);
            return;
        }

        sCartProducts[i].count++;
        sCartProducts[i].totalPrice =
            sCartProducts[i].count * sCartProducts[i].price;

        cartProducts.set([...sCartProducts]);
    };
</script>

<div class="product">
    <img
        class="product-img"
        src={productData.imageUrl}
        alt=""
    />
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
            <div class="product-price">Rs. {productData.price}</div>
        </div>
    </div>
</div>

<style>
    .product {
        padding: 0.5rem 0.5rem 1rem;
        width: 200px;
        background-color: #fff;
        border-radius: 3px;
        box-shadow: 1px 1px 1px rgb(46 128 187 / 20%);
    }

    .product-img {
        width: 100%;
        height: 200px;
        object-fit: contain;
    }

    .product-text {
        margin-top: 1rem;
        padding: 0 .5rem;
        font-size: 0.9rem;
    }

    .product-text-below {
        margin-top: 1.5rem;
        font-size: 0.9rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .product-add-btn {
        padding: 0.5rem 1rem;
        color: #fff;
        background-color: var(--blue);
        border-radius: 3px;
        cursor: pointer;
    }

    .out-stock-txt{
        font-style: italic;
        color: #e74c3c;
    }

    .cart-product-add-minus-btns {
        display: flex;
        align-items: center;
    }

    .cart-product-count {
        padding: 0.5rem 0.75rem;
    }

    .cart-product-minus-btn,
    .cart-product-plus-btn {
        padding: 0.5rem;
        color: #fff;
        background-color: var(--blue);
        border: none;
        border-radius: 5px;
    }

    .cart-product-minus-btn:hover,
    .cart-product-plus-btn:hover {
        color: white;
        background-color: var(--blue);
    }

    .product-price {
        font-style: italic;
        color: #797979;
    }
</style>
