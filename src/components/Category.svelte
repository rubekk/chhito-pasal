<script>
    import { goto } from "$app/navigation";

    export let category = {
        categoryName: "",
        breakdown: []
    };

    const gotoCategory = () => {
        goto(`/category/${category.slug}`);
    };
</script>

<div class="category" on:click={gotoCategory}>
    <div class="category-content">
        <h3>{category.categoryName}</h3>
        <i class="fa-solid fa-arrow-right"></i>
    </div>
</div>

<style>
    .category {
        padding: 1rem;
        width: 150px;
        height: 150px;
        color: #fff;
        background: linear-gradient(135deg, var(--green) 30%, #4CAF50 90%); /* Gradient background */
        border-radius: 12px; /* Soft corners */
        font-weight: bold;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column; /* Stack text and icon */
        position: relative; /* For pseudo-element */
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2); /* Deeper shadow for better depth */
        cursor: pointer;
        transition: transform 0.3s ease, box-shadow 0.3s ease; /* Smooth transitions */
    }

    .category-content {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .category h3 {
        margin: 0; /* Remove default margin */
        font-size: 1.1rem; /* Slightly larger font for category name */
        color: #fff; /* Ensure text is white */
    }

    .fa-arrow-right {
        margin-top: 0.5rem; /* Space between title and icon */
        color: #fff; /* Icon color */
        font-size: 1.5rem; /* Icon size */
    }
</style>
