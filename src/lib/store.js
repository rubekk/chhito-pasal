import { writable } from 'svelte/store';

export const productsData= writable([
    {   
        productId: crypto.randomUUID(),
        productName: "1 crate egg (30 pcs)",
        price: 525
    },
    {   
        productId: crypto.randomUUID(),
        productName: "1 crate egg (30 pcs)",
        price: 525
    },
    {   
        productId: crypto.randomUUID(),
        productName: "1 crate egg (30 pcs)",
        price: 525
    },
    {   
        productId: crypto.randomUUID(),
        productName: "1 crate egg (30 pcs)",
        price: 525
    }
]);

export const cartProducts= writable([]);