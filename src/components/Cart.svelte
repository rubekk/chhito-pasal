<script>
    import { cartProducts } from "$lib/store";

    let sCartProducts= [];

    cartProducts.subscribe(value =>{
        sCartProducts= value
    })
</script>

{#each sCartProducts as cartProduct}
    {cartProduct.productName}
{/each}