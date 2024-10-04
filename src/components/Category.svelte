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
        background: linear-gradient(135deg, var(--green) 30%, #4CAF50 90%); 
        border-radius: 12px; 
        font-weight: bold;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column; 
        position: relative; 
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2); 
        cursor: pointer;
        transition: transform 0.3s ease, box-shadow 0.3s ease; 
    }

    .category-content {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .category h3 {
        margin: 0; 
        font-size: 1.1rem; 
        color: #fff; 
    }

    .fa-arrow-right {
        margin-top: 0.5rem; 
        color: #fff; 
        font-size: 1.5rem; 
    }

    /* media queries */
    @media(max-width: 700px) {
       .category {
            width: 140px;
            height: 140px;
       }

       .category h3 {
            font-size: 1rem; 
        }
    }
</style>
