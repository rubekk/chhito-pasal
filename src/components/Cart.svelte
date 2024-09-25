<!-- <script>
    import { cartProducts, showCart } from "$lib/store";

    let sCartProducts= [];
    let totalPrice= 0;
    let deliveryCharge= 0;

    cartProducts.subscribe(value =>{
        sCartProducts= value
    })

    const closeCart= ()=>{
        showCart.set(false)
    }

    const handleCartMinus= id=>{
        

        if(i<0) return;
        if(sCartProducts[i].count>0) sCartProducts[i].count--;
        if(sCartProducts[i].count==0) sCartProducts.splice(i, 1);
        sCartProducts= [...sCartProducts];

        cartProducts.set(sCartProducts);
        if(sCartProducts[i].count>0) handleSingleProductPrice(id);
    }

    const handleCartPlus= id=>{
        let i= sCartProducts.findIndex(product=> product.productId == id);

        if(i<0) return;
        sCartProducts[i].count++;
        sCartProducts= [...sCartProducts];

        cartProducts.set(sCartProducts);
        handleSingleProductPrice(id);
    }

    const handleSingleProductPrice= id=>{
        let i= sCartProducts.findIndex(product=> product.productId == id);

        if(i<0) return;
        sCartProducts[i].totalPrice= sCartProducts[i].count * sCartProducts[i].price;

        handleTotalPrice()
    }

    const handleTotalPrice= ()=>{
        totalPrice= 0;
        sCartProducts.forEach(product =>{
            totalPrice+= product.totalPrice;
        })
    }

    $: {
        if(sCartProducts) handleTotalPrice();
    }
</script>

<div class="cart-products-container">
    <button class="cart-close-btn" on:click={closeCart}>
        <i class="fa-solid fa-times"></i>
    </button>
    {#each sCartProducts as cartProduct}
    <div class="cart-product">
        <img class="cart-product-img" src="https://makanamarket.com/uploads/84154-20230524100518.jpg" alt="">
        <div class="cart-product-txt">
            <div class="cart-product-name">{cartProduct.productName}</div>
            <div class="cart-product-txt-below">
                <div class="cart-product-price">Rs. {cartProduct.price} {cartProduct.totalPrice}</div>
                <div class="cart-product-add-minus-btns">
                    <button class="cart-product-minus-btn" on:click={()=> handleCartMinus(cartProduct.productId)}>
                        <i class="fa-solid fa-minus"></i>
                    </button>
                    <div class="cart-product-count">{cartProduct.count}</div>
                    <button class="cart-product-plus-btn" on:click={()=> handleCartPlus(cartProduct.productId)}>
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
    {/each}
    Total Price: {totalPrice}
    Delivery Charge: {deliveryCharge}
</div>

<style>
    .cart-products-container{
        padding-top: 2rem;
        width: max-content;
        height: 100vh;
        background-color: #fff;
        border: 1px solid #dcdcdc;
        border-radius: 3px;
    }
    .cart-close-btn{
        font-size: 1.25rem;
        background-color: transparent;
        border: none;
        position: absolute;
        top: 1rem;
        right: 1rem;
    }
    .cart-product{
        padding: .5rem;
        margin: .5rem;
        width: max-content;
        border-bottom: 1px solid #dcdcdc;
        border-radius: 3px;
        display: flex;
    }
    .cart-product-img{
        width: 75px;
        height: 75px;
    }
    .cart-product-txt{
        padding: 1rem 2rem;
    }
    .cart-product-txt-below{
        margin-top: .75rem;
        width: 200px;
        font-size: .8rem;
        display: flex;
        justify-content: space-between;
    }
    .cart-product-add-minus-btns{
        display: flex;
    }
    .cart-product-add-minus-btns button, .cart-product-count{
        width: 25px;
        height: 25px;
        outline: none;
        border: 1px solid #dcdcdc;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .cart-product-count{
        width: 40px;
        border-left: none;
        border-right: none;
    }
</style> -->


<script>
    import { cartProducts, showCart } from "$lib/store";

    let sCartProducts = [];
    let totalPrice = 0;
    let deliveryCharge = 0;

    cartProducts.subscribe(value => {
        sCartProducts = value;
    });

    const closeCart = () => {
        showCart.set(false);
    };

    const handleCartMinus = (id) => {
        let i = sCartProducts.findIndex(product => product.productId == id);

        if (i < 0) return;
        if (sCartProducts[i].count > 0) sCartProducts[i].count--;
        if (sCartProducts[i].count == 0) sCartProducts.splice(i, 1);

        sCartProducts = [...sCartProducts];
        cartProducts.set(sCartProducts);
        if (sCartProducts[i]?.count > 0) handleSingleProductPrice(id);
    };

    const handleCartPlus = (id) => {
        let i = sCartProducts.findIndex(product => product.productId == id);

        if (i < 0) return;
        sCartProducts[i].count++;
        sCartProducts = [...sCartProducts];

        cartProducts.set(sCartProducts);
        handleSingleProductPrice(id);
    };

    const handleSingleProductPrice = (id) => {
        let i = sCartProducts.findIndex(product => product.productId == id);

        if (i < 0) return;
        sCartProducts[i].totalPrice = sCartProducts[i].count * sCartProducts[i].price;

        handleTotalPrice();
    };

    const handleTotalPrice = () => {
        totalPrice = 0;
        sCartProducts.forEach(product => {
            totalPrice += product.totalPrice;
        });
    };

    $: if (sCartProducts) handleTotalPrice();
</script>

<div class="cart-products-container">
    <div class="cart-header">
        <button class="cart-close-btn" on:click={closeCart}>
            <i class="fa-solid fa-times"></i>
        </button>
        <h2 class="cart-title">Your Cart</h2>
    </div>

    {#each sCartProducts as cartProduct}
    <div class="cart-product">
        <img class="cart-product-img" src="https://makanamarket.com/uploads/84154-20230524100518.jpg" alt="">
        <div class="cart-product-details">
            <div class="cart-product-name">{cartProduct.productName}</div>
            <div class="cart-product-info">
                <div class="cart-product-price">Rs. {cartProduct.price} x {cartProduct.count} = Rs. {cartProduct.totalPrice}</div>
                <div class="cart-product-controls">
                    <button class="cart-product-minus-btn" on:click={() => handleCartMinus(cartProduct.productId)}>
                        <i class="fa-solid fa-minus"></i>
                    </button>
                    <div class="cart-product-count">{cartProduct.count}</div>
                    <button class="cart-product-plus-btn" on:click={() => handleCartPlus(cartProduct.productId)}>
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
    {/each}

    <div class="cart-summary">
        <div>Total Price: <span>Rs. {totalPrice}</span></div>
        <div>Delivery Charge: <span>Rs. {deliveryCharge}</span></div>
        <div class="total-amount">Total Amount: <span>Rs. {totalPrice + deliveryCharge}</span></div>
    </div>
</div>

<style>
    .cart-products-container {
        padding: 2rem;
        width: 350px;
        height: 100vh;
        background-color: #fff;
        border-left: 2px solid #ddd;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        overflow-y: auto;
        position: fixed;
        right: 0;
        top: 0;
        z-index: 1000;
    }

    .cart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }

    .cart-title {
        font-size: 1.5rem;
        font-weight: bold;
        margin: 0;
    }

    .cart-close-btn {
        font-size: 1.25rem;
        background-color: transparent;
        border: none;
        cursor: pointer;
    }

    .cart-product {
        display: flex;
        align-items: center;
        padding: 1rem 0;
        border-bottom: 1px solid #e0e0e0;
        margin-bottom: 1rem;
    }

    .cart-product-img {
        width: 70px;
        height: 70px;
        border-radius: 8px;
        object-fit: cover;
        margin-right: 1rem;
    }

    .cart-product-details {
        flex-grow: 1;
    }

    .cart-product-name {
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }

    .cart-product-info {
        font-size: 0.9rem;
        color: #555;
    }

    .cart-product-controls {
        display: flex;
        align-items: center;
        margin-top: 0.5rem;
    }

    .cart-product-count {
        margin: 0 0.75rem;
        font-weight: 600;
        font-size: 1rem;
    }

    .cart-product-minus-btn, .cart-product-plus-btn {
        background-color: #f0f0f0;
        border: none;
        padding: 0.5rem;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.9rem;
    }

    .cart-summary {
        padding: 1rem;
        background-color: #fafafa;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        margin-top: 2rem;
    }

    .cart-summary div {
        display: flex;
        justify-content: space-between;
        font-size: 1rem;
        margin-bottom: 0.5rem;
    }

    .total-amount {
        font-weight: bold;
        font-size: 1.2rem;
        color: #e74c3c;
    }

    .cart-product-minus-btn:hover, .cart-product-plus-btn:hover {
        background-color: #e74c3c;
        color: white;
    }
</style>
