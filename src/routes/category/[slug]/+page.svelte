<script>
  import Product from "../../../components/Product.svelte";
  import { collection, query, where, getDocs } from "firebase/firestore";
  import { db } from '$lib/firebaseConfig'; 

  export let data;

  const categoryData = data.data;
  let subCategory = categoryData.breakdown[0];
  let sProductsData = [];

  async function fetchProductsByCategory(category) {
    try {
      const products = [];
      
      const q = query(
        collection(db, "products"), 
        where("category", "==", category)
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

  const chooseSubCategory = breakdown => {
    subCategory = breakdown
  }

  $: fetchProductsByCategory(subCategory).then((products) => {
    sProductsData = products
  });
</script>

<div class="category-container">
  <div class="breakdowns-container">
    <div class="title">
      <i class="fa-solid fa-arrow-left"></i>
      <h3>{categoryData.categoryName}</h3>
    </div>
    <div class="vertical-line"></div>
    <div class="breakdowns">
      {#each categoryData.breakdown as breakdown}
        <span on:click={() => chooseSubCategory(breakdown)} class={breakdown == subCategory ? "breakdown-item active" : "breakdown-item"}>{breakdown}</span>
      {/each}
    </div>
  </div>

  <div class="products-container">
    {#each sProductsData as productData}
        <Product {productData} />
    {/each}
</div>
</div>

<style>
  .products-container {
      padding: 2rem 0;
      margin: auto;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
  }
  .category-container {
    width: 100%;
    background-color: #fff;
  }
  
  .breakdowns-container {
    padding: 1rem;
    height: 75px;
    border: 1px solid #cecece;
    border-bottom: 2px solid var(--blue);
    border-top: none;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); 
  }

  .fa-arrow-left {
    margin-right: 1rem; 
    color: var(--blue); 
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

  .breakdowns {
    display: flex;
    align-items: center;
  }

  .breakdowns .breakdown-item {
    padding: 0.5rem 1rem;
    margin: 0 0.5rem;
    border: 1px solid var(--green); 
    border-radius: 15px;
    transition: background-color 0.3s ease, transform 0.3s ease; 
    cursor: pointer; 
  }

  .breakdowns .active, .breakdown-item:hover {
    color: #fff;
    background-color: var(--blue); 
  }
  
  .breakdown-item:hover {
    color: #fff;
    background-color: var(--blue); 
    transform: scale(1.05); 
  }
</style>
