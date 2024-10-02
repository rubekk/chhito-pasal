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

export const productsData= writable([]);

export const categories = [
    {
        categoryName: "Rice, Pulses, Pitho and Oils",
        breakdown: ["Rice", "Pulses", "Pitho", "Oils"],
        slug: "rice-pulses-pitho-oils"
    },
    {
        categoryName: "Dairy, Eggs and Biscuits",
        breakdown: ["Dairy", "Eggs", "Biscuits"],
        slug: "dairy-eggs-biscuits"
    },
    {
        categoryName: "Juices and Cold Drinks",
        breakdown: ["Juices", "Cold drinks", "Energy drinks"],
        slug: "juices-cold-drinks"
    },
    {
        categoryName: "Snacks, Chips and Noodles",
        breakdown: ["Chips", "Noodles", "Cheese balls"],
        slug: "snacks-chips-noodles"
    },
    {
        categoryName: "Soaps and Detergents",
        breakdown: ["Bodycare Soaps", "Washing soaps", "Detergents", "Shampoo"],
        slug: "soaps-detergents"
    },
    {
        categoryName: "Ciggarettes and Alcohol",
        breakdown: ["Ciggarettes", "Beer", "Complementaries"],
        slug: "ciggarettes-alcohol"
    },
    {
        categoryName: "Masala",
        breakdown: ["Masala powder", "Dana"],
        slug: "masala"
    }
];

export const cartProducts= writable([]);

export const showCart= writable(false);