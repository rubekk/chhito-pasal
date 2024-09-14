<script>
    import { cartProducts } from "$lib/store";
    
    export let productData= {
        productId: crypto.randomUUID,
        productName: "Product name",
        price: 100
    }

    let sCartProducts= [];

    cartProducts.subscribe(value =>{
        sCartProducts= value
    })

    const handleClick= ()=>{
        if(sCartProducts.some(product=> product.productId== productData.productId)){
            let i= sCartProducts.findIndex(product=> product.productId== productData.productId);

            sCartProducts[i].count++;
        }
        else{
            productData.count= 1;
            sCartProducts.push(productData);
        }

        cartProducts.set(sCartProducts);
    }
</script>

<div class="product">
    <img class="product-img" src="https://makanamarket.com/uploads/84154-20230524100518.jpg" alt="">
    <div class="product-text">
        <div class="product-name">{productData.productName}</div>
        <div class="product-text-below">
            <div class="product-add-btn" on:click={handleClick}>Add</div>
            <div class="product-price">Rs. {productData.price}</div>
        </div>
    </div>
</div>

<style>
    .product{
        padding: .5rem;
        width: 175px;
        border: 1px solid #dcdcdc;
        border-radius: 3px;
    }
    .product-img{
        width: 100%;
    }
    .product-text{
        margin-top: 1rem;
        font-size: .9rem;
    }
    .product-text-below{
        margin-top: 1rem;
        font-size: .8rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .product-add-btn{
        padding: .25rem 1rem;
        border: 1px solid #dcdcdc;
        border-radius: 3px;
        cursor: pointer;
    }
</style>