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
            (product) => product.productId === productData.productId,
        );
        productInCart = cartProduct;
    });

    const handleAddClick = () => {
        if (
            sCartProducts.some(
                (product) => product.productId === productData.productId,
            )
        )
            return;

        let newProduct = {
            ...productData,
            count: 1,
            totalPrice: productData.price,
        };

        cartProducts.set([...sCartProducts, newProduct]);
    };

    const handleCartMinus = () => {
        let i = sCartProducts.findIndex(
            (product) => product.productId === productData.productId,
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
        let i = sCartProducts.findIndex(
            (product) => product.productId === productData.productId,
        );
        if (i < 0) return;

        sCartProducts[i].count++;
        sCartProducts[i].totalPrice =
            sCartProducts[i].count * sCartProducts[i].price;

        cartProducts.set([...sCartProducts]);
    };
</script>

<div class="product">
    <img
        class="product-img"
        src="https://makanamarket.com/uploads/84154-20230524100518.jpg"
        alt=""
    />
    <div class="product-text">
        <div class="product-name">{productData.productName}</div>
        <div class="product-text-below">
            {#if !productInCart}
                <div class="product-add-btn" on:click={handleAddClick}>Add</div>
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
        padding: 0.5rem;
        width: 200px;
        border: 1px solid #dcdcdc;
        border-radius: 3px;
    }

    .product-img {
        width: 100%;
    }

    .product-text {
        margin-top: 1rem;
        font-size: 0.9rem;
    }

    .product-text-below {
        margin-top: 1rem;
        font-size: 0.8rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .product-add-btn {
        padding: 0.25rem 1rem;
        border: 1px solid #dcdcdc;
        border-radius: 3px;
        cursor: pointer;
    }

    .cart-product-add-minus-btns {
        display: flex;
    }

    .cart-product-add-minus-btns button,
    .cart-product-count {
        width: 25px;
        height: 25px;
        outline: none;
        border: 1px solid #dcdcdc;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .cart-product-count {
        width: 40px;
        border-left: none;
        border-right: none;
    }
</style>
