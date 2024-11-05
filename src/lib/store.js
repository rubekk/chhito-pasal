import { writable } from 'svelte/store';

export const authStore = writable({
    loggedIn: false,
    user: null
});

export const storeLocation = writable([27.665322, 85.330719]);

export const userLocation = writable({
    coords: [],
    place: "",
    distance: 0,
    deliveryTime: 0,
    deliveryAvailable: true
});

export const storeOpen = writable(true);

export const welcomeShown = writable(false);

export const hasPhone = writable(false);

export const productsData= writable([]);

export const featuredProductsData = writable([]);

export const dailyEssentialsData = writable([]);

export const categoriesData = writable([]);

export const categories = [
    {
        categoryName: "Cooking Essentials",
        categorySubName: "Rice, Dal, Pitho and Oil",
        breakdown: ["Rice", "Dal", "Pitho", "Oil"],
        breakdownImages: ["ashiyana-green-label", "musur-dal", "maida", "swastik-bhatmas-one"],
        slug: "cooking-essentials"
    },
    {
        categoryName: "Dairy & Essentials",
        categorySubName: "Dairy, Eggs and Milk Supplements",
        breakdown: ["Dairy", "Eggs", "Milk Supplements"],
        breakdownImages: ["milk-packet", "egg", "horlicks"],
        slug: "dairy-and-essentials"
    },
    {
        categoryName: "Beverages",
        categorySubName: "Juices, Cold Drinks and Energy Drinks",
        breakdown: ["Juices", "Cold Drinks", "Energy Drinks"],
        breakdownImages: ["jj-pineapple", "cocacola-jumbo", "xtreme"],
        slug: "beverages"
    },
    {
        categoryName: "Snacks",
        categorySubName: "Chips, Noodles, Biscuits and Chocolates",
        breakdown: ["Chips", "Noodles", "Biscuits", "Chocolates"],
        breakdownImages: ["potato-cracker", "current-hns-pack", "digestive-nuts", "dark-fantasy"],
        slug: "snacks"
    },
    {
        categoryName: "Household Essentials",
        categorySubName: "Cleaning Supplies, Incense",
        breakdown: ["Cleaning Supplies", "Incense"],
        breakdownImages: ["rin-mini", "bateko-dhoop"],
        slug: "household-essentials"
    },
    {
        categoryName: "Personal Care",
        categorySubName: "Soaps, Shampoos, Dental Care and Others",
        breakdown: ["Soaps", "Shampoos", "Dental Care", "Additional Care"],
        breakdownImages: ["dove", "sunsilk-black", "closeup-mini", "sancho"],
        slug: "personal-care"
    },
    {
        categoryName: "Chitto Bar",
        categorySubName: "Ciggarettes and Alcohol",
        breakdown: ["Ciggarettes", "Beer", "Complementaries"],
        breakdownImages: ["surya-arctic", "gorkha-strong", "happydent-wave"],
        slug: "chitto-bar"
    },
    {
        categoryName: "Masala & Papad",
        categorySubName: "Masala and Papad",
        breakdown: ["Masala", "Papad", "Soups and Sauces"],
        breakdownImages: ["khursani-dhulo", "pashupati-papad", "veg-soup"],
        slug: "masala-and-papad"
    }
];

export const cartProducts= writable([]);

export const showCart= writable(false);