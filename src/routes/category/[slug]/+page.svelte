<script>
  import { tick } from "svelte";
  import { goto } from "$app/navigation";
  import { categoriesData, showCart, cartProducts } from "$lib/store";
  import { collection, query, where, getDocs } from "firebase/firestore";
  import { db } from "$lib/firebaseConfig";
  import Product from "../../../components/Product.svelte";

  export let data;

  const categoryData = data.data;
  let subCategory = categoryData.breakdown[0];
  let sCategoriesData = [];
  let sProductsData = [];
  let sCartProductsCount = 0;
  let breakdownsContainer;
  let showLeftButton = false;
  let showRightButton = false;

  categoriesData.subscribe((value) => {
    sCategoriesData = value;
  });
  cartProducts.subscribe((value) => {
    sCartProductsCount = value.length;
  });

  async function fetchProductsByCategory(category) {
    let currentCategory = sCategoriesData.find((obj) =>
      obj.hasOwnProperty(category),
    );

    if (currentCategory && currentCategory[category].length > 0)
      return currentCategory[category];

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

      sCategoriesData.push({ [category]: products });
      categoriesData.set([...sCategoriesData]);

      return products;
    } catch (error) {
      return [];
    }
  }

  fetchProductsByCategory(subCategory).then((products) => {
    sProductsData = products;
  });

  const chooseSubCategory = async (breakdown) => {
    subCategory = breakdown;

    sProductsData = [];
    await tick();

    sProductsData = await fetchProductsByCategory(subCategory);
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
        {#each categoryData.breakdown as breakdown, index}
          <span
            on:click={() => chooseSubCategory(breakdown)}
            class={breakdown == subCategory
              ? "breakdown-item active"
              : "breakdown-item"}
          >
            <img
              src={`/products/${categoryData.breakdownImages[index]}.jpg`}
              alt=""
            />
            {breakdown}
          </span>
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

<div class="page-cart" on:click={() => showCart.set(true)}>
  <i class="fa-solid fa-cart-shopping"></i>
  {#if sCartProductsCount > 0}
    <span>{sCartProductsCount}</span>
  {/if}
</div>

<style>
  .category-container {
    width: 100%;
  }

  .products-container {
    padding: 1rem 0;
    margin: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .breakdowns-container {
    padding: 1rem;
    height: 75px;
    background-color: #fff;
    border: 1px solid var(--green);
    border-radius: 5px;
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
    font-size: 1rem;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    color: var(--blue);
  }

  .title h3 {
    font-size: 1rem;
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
    padding: 0.5rem;
    margin: 0 0.5rem;
    font-size: 0.9rem;
    border: 2px solid var(--green);
    border-radius: 15px;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    transition:
      background-color 0.3s ease,
      transform 0.3s ease;
    cursor: pointer;
  }

  .breakdown-item img {
    width: 25px;
    height: 25px;
    object-fit: contain;
  }

  .breakdowns .active,
  .breakdown-item:hover {
    transition: 0.2s;
    border: 2px solid var(--blue);
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

  .page-cart {
    width: 55px;
    height: 50px;
    background-color: #fff;
    border: 1px solid #dcdcdc;
    border-radius: 7px;
    display: none;
    align-items: center;
    justify-content: center;
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    z-index: 100;
    background: linear-gradient(90deg, #a8e6cf, #dcedf7);
    background-size: 400% 400%;
    animation: gradient 7s ease infinite;
    cursor: pointer;
  }

  .page-cart i {
    font-size: 1.25rem;
    color: rgba(0, 0, 0, 0.8);
  }

  .page-cart span {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--green);
    position: absolute;
    top: 5px;
    right: 5px;
  }

  /* media queries */
  @media (max-width: 1200px) {
    .page-cart {
      display: flex;
    }
  }
  @media (max-width: 800px) {
    .products-container {
      padding: 1rem 0.5rem;
    }
  }
  @media (max-width: 900px) {
    .breakdowns-container {
      height: 135px;
      align-items: flex-start;
      justify-content: space-between;
      flex-direction: column;
    }
    .title {
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
