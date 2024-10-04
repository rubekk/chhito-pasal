<script>
  import Product from "../../../components/Product.svelte";
  import { goto } from '$app/navigation';
  import { collection, query, where, getDocs } from "firebase/firestore";
  import { db } from "$lib/firebaseConfig";

  export let data;

  const categoryData = data.data;
  let subCategory = categoryData.breakdown[0];
  let sProductsData = [];
  let breakdownsContainer;
  let showLeftButton = false;
  let showRightButton = false;

  async function fetchProductsByCategory(category) {
    try {
      const products = [];

      const q = query(
        collection(db, "products"),
        where("category", "==", category),
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
      });

      return products;
    } catch (error) {
      return [];
    }
  }

  const chooseSubCategory = (breakdown) => {
    subCategory = breakdown;
  };

  const checkScrollButtons = () => {
    if (breakdownsContainer) {
      showLeftButton = breakdownsContainer.scrollLeft > 0;
      showRightButton =
        breakdownsContainer.scrollLeft <
        breakdownsContainer.scrollWidth - breakdownsContainer.clientWidth;
    }
    breakdownsContainer;
  };

  const scrollLeft = () => {
    if (breakdownsContainer) {
      breakdownsContainer.scrollBy({ left: -200, behavior: "smooth" });
      checkScrollButtons();
    }
  };

  const scrollRight = () => {
    if (breakdownsContainer) {
      breakdownsContainer.scrollBy({ left: 200, behavior: "smooth" });
      checkScrollButtons(); 
    }
  };

  $: fetchProductsByCategory(subCategory).then((products) => {
    sProductsData = products;
  });
</script>

<div class="category-container">
  <div class="breakdowns-container">
    <div class="title">
      <i on:click={() => goto(`/`)} class="fa-solid fa-arrow-left"></i>
      <h3>{categoryData.categoryName}</h3>
    </div>
    <div class="vertical-line"></div>
    <div class="breakdowns-wrapper">
      <div
        class="breakdowns"
        bind:this={breakdownsContainer}
        on:scroll={checkScrollButtons}
      >
        {#each categoryData.breakdown as breakdown}
          <span
            on:click={() => chooseSubCategory(breakdown)}
            class={breakdown == subCategory
              ? "breakdown-item active"
              : "breakdown-item"}>{breakdown}</span
          >
        {/each}
      </div>
      {#if showLeftButton}
        <button class="scroll-button scroll-left" on:click={scrollLeft}>
          <i class="fa-solid fa-chevron-left"></i>
        </button>
      {/if}
      {#if showRightButton}
        <button class="scroll-button scroll-right" on:click={scrollRight}>
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      {/if}
    </div>
  </div>

  <div class="products-container">
    {#each sProductsData as productData}
      <Product {productData} />
    {/each}
  </div>
</div>

<style>
  .category-container {
    width: 100%;
    background-color: #fff;
    border: 1px solid #cecece;
    border-top: none;
  }

  .products-container {
    padding: 2rem 1rem;
    margin: auto;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .breakdowns-container {
    padding: 1rem;
    height: 75px;
    border-bottom: 2px solid var(--blue);
    display: flex;
    align-items: center;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  .fa-arrow-left {
    margin-right: 1rem;
    color: var(--blue);
    cursor: pointer;
  }

  .title {
    font-size: 1.25rem;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    color: var(--blue);
  }

  .vertical-line {
    margin: 0 2rem;
    width: 2px;
    height: 50%;
    background-color: #cecece;
  }

  .breakdowns-wrapper {
    position: relative;
  }

  .breakdowns {
    display: flex;
    align-items: center;
    overflow-x: scroll;
    overflow-y: hidden;
    scrollbar-width: none;
  }

  .breakdowns .breakdown-item {
    padding: 0.5rem 1rem;
    margin: 0 0.5rem;
    border: 1px solid var(--green);
    border-radius: 15px;
    white-space: nowrap;
    transition:
      background-color 0.3s ease,
      transform 0.3s ease;
    cursor: pointer;
  }

  .breakdowns .active,
  .breakdown-item:hover {
    color: #fff;
    background-color: var(--blue);
  }

  .breakdown-item:hover {
    color: #fff;
    background-color: var(--blue);
    transform: scale(1.05);
  }

  .scroll-button {
    height: 40px;
    width: 40px;
    color: #000;
    background-color: rgba(255, 255, 255, 0.3);
    border: 1px solid #eaeaea;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    z-index: 1;
  }

  .scroll-left {
    left: 5px;
  }

  .scroll-right {
    right: 5px;
  }

  /* media queries */
  @media (max-width: 900px) {
    .breakdowns-container {
      height: 150px;
      align-items: flex-start;
      justify-content: space-between;
      flex-direction: column;
    }
    .title {
      font-size: 1.1rem;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .vertical-line {
      margin: 1rem 0;
      height: 1px;
      width: 100%;
    }
    .breakdowns-wrapper {
      width: 100%;
    }
  }
</style>
