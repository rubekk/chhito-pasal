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

<div class={`category ${category.slug}`} on:click={gotoCategory}>
    <div class="category-image">
        <img src={`/categories/${category.slug}.png`} alt="">
    </div>
    <div class="category-text">{category.categoryName}</div>
</div>

<style>
    .cooking-essentials {
        grid-area: 1/1/2/3;
    }

    .dairy-and-essentials {
        grid-area: 1/3/2/5;
    }

    .masala-and-papad {
        grid-area : 2/3/3/5;
    }

    .category-image {
        height: 170px;
        color: #fff;
        background-color: #fff;
        background: linear-gradient(#a8e6cf, #f1fdff);
        border: 2px solid #fff;
        border-bottom: 2px solid #dcdcdc;
        border-radius: 12px; 
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative; 
        cursor: pointer;
    }

    .category-image img {
        width: 100%;
        max-height: 165px;
        object-fit: contain;
    }

    .category-text {
        margin-top: .5rem;
        font-size: .9rem;
        text-align: center;
        color: #3a3a3a;
    }

    /* media queries */
    @media (max-width: 650px) {
        .category-image {
            height: 160px;
        }
    }
    @media (max-width: 550px) {
        .cooking-essentials {
            grid-area: 1/1/2/3;
        }
        .dairy-and-essentials {
            grid-area: 2/2/3/4;
        }
        .beverages {
            grid-area: 1/3/2/3;
        }
        .snacks {
            grid-area: 2/1/3/2;
        }
        .household-essentials {
            grid-area: 3/1/4/2;
        }
        .personal-care {
            grid-area: 3/2/4/3;
        }
        .chitto-bar {
            grid-area: 3/3/4/4;
        }
        .masala-and-papad {
            grid-area : 4/1/5/3;
        }
    }
</style>
