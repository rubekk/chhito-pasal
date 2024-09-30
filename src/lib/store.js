import { writable } from 'svelte/store';

export const authStore = writable({
    loggedIn: false,
    user: null
});

export const storeLocation = writable([27.665322, 85.330719]);

export const userLocation= writable({
    coords: [],
    place: "",
    distance: 0,
    deliveryTime: 0,
    deliveryAvailable: true
});

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

export const showCart= writable(false);