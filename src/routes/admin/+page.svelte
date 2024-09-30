<script>
    import { initializeApp } from "firebase/app";
    import { getFirestore, collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";
    import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
    import { onMount } from "svelte";

    // Firebase configuration (replace with your Firebase credentials)
    const firebaseConfig = {
        apiKey: "AIzaSyA48xm1MjqdslMQNJ8KC7t8cyQxb7_JVM4",
        authDomain: "onlineshop-48c01.firebaseapp.com",
        projectId: "onlineshop-48c01",
        storageBucket: "onlineshop-48c01.appspot.com",
        messagingSenderId: "556297026777",
        appId: "1:556297026777:web:d77af098bbdf00420192c8"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const storage = getStorage(app);

    let productName = "";
    let price = "";
    let discountedPrice = "";
    let imageFile = null;
    let category = "";
    let stock = "";
    let uploadStatus = "";
    let products = [];
    let editingProductId = null;

    // Fetch products from Firestore
    onMount(async () => {
        await fetchProducts();
    });

    const fetchProducts = async () => {
        const querySnapshot = await getDocs(collection(db, "products"));
        products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const handleImageChange = (e) => {
        imageFile = e.target.files[0];
    };

    const uploadProduct = async () => {
        if (!productName || !price || !category || !stock || !imageFile) {
            uploadStatus = "Please fill all fields and select an image.";
            return;
        }

        try {
            const storageRef = ref(storage, `products/${imageFile.name}`);
            await uploadBytes(storageRef, imageFile);
            const imageUrl = await getDownloadURL(storageRef);

            await addDoc(collection(db, "products"), {
                productName,
                price: Number(price),
                discountedPrice: Number(discountedPrice),
                category,
                stock: Number(stock),
                imageUrl
            });

            uploadStatus = "Product uploaded successfully!";
            resetForm();
            await fetchProducts(); // Refresh product list
        } catch (error) {
            uploadStatus = "Failed to upload product: " + error.message;
        }
    };

    const resetForm = () => {
        productName = "";
        price = "";
        discountedPrice = "";
        imageFile = null;
        category = "";
        stock = "";
        uploadStatus = "";
        editingProductId = null;
    };

    const editProduct = (product) => {
        productName = product.productName;
        price = product.price;
        discountedPrice = product.discountedPrice;
        category = product.category;
        stock = product.stock;
        editingProductId = product.id;
    };

    const updateProduct = async () => {
        if (!editingProductId) return;

        try {
            const productRef = doc(db, "products", editingProductId);
            await updateDoc(productRef, {
                productName,
                price: Number(price),
                discountedPrice: Number(discountedPrice),
                category,
                stock: Number(stock),
            });

            uploadStatus = "Product updated successfully!";
            resetForm();
            await fetchProducts(); // Refresh product list
        } catch (error) {
            uploadStatus = "Failed to update product: " + error.message;
        }
    };
</script>

<!-- Admin Panel UI -->
<div class="admin-panel">
    <h1>Admin Panel - Upload Product</h1>

    <div class="input-group">
        <input type="text" placeholder="Product Name" bind:value={productName} />
    </div>

    <!-- Price and Discounted Price in the same row -->
    <div class="input-row">
        <div class="input-group">
            <input type="number" placeholder="Price" bind:value={price} />
        </div>
        <div class="input-group">
            <input type="number" placeholder="Discounted Price" bind:value={discountedPrice} />
        </div>
    </div>

    <div class="input-group">
        <input type="text" placeholder="Category" bind:value={category} />
    </div>

    <!-- Stock and Image Upload in the same row -->
    <div class="input-row">
        <div class="input-group">
            <input type="number" placeholder="Stock" bind:value={stock} />
        </div>
        <div class="input-group">
            <input type="file" accept="image/*" on:change={handleImageChange} />
        </div>
    </div>

    <div class="button-group">
        {#if editingProductId}
            <button on:click={updateProduct}>Update Product</button>
        {:else}
            <button on:click={uploadProduct}>Upload Product</button>
        {/if}
    </div>

    <div class="status">
        <p>{uploadStatus}</p>
    </div>
</div>

<!-- Product List -->
<div class="product-list">
    <h2>Product List</h2>
    {#each products as product}
        <div class="product-item">
            <img src={product.imageUrl} alt={product.productName} style="width: 100px; height: auto;" />
            <div>
                <h3>{product.productName}</h3>
                <p>Price: ${product.price}</p>
                <p>Discounted Price: ${product.discountedPrice}</p>
                <p>Category: {product.category}</p>
                <p>Stock: {product.stock}</p>
                <button on:click={() => editProduct(product)}>Edit</button>
            </div>
        </div>
    {/each}
</div>

<style>
    .admin-panel {
        max-width: 600px;
        margin: 3rem auto;
        padding: 2rem;
        background-color: #f7f7f7;
        border-radius: 12px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        font-family: 'Roboto', sans-serif;
        color: #333;
    }

    h1 {
        text-align: center;
        color: #2c3e50;
        margin-bottom: 2.5rem;
        font-size: 1.8rem;
        font-weight: bold;
    }

    .input-group {
        margin-bottom: 1.25rem;
    }

    /* New input-row style */
    .input-row {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
    }

    input {
        width: 100%;
        padding: 0.9rem;
        font-size: 1rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-sizing: border-box;
        transition: border-color 0.3s ease;
        background-color: #fff;
        color: #333;
    }

    input:focus {
        border-color: #2980b9;
        outline: none;
        box-shadow: 0 0 8px rgba(41, 128, 185, 0.3);
    }

    .button-group {
        text-align: center;
    }

    button {
        padding: 0.75rem 2.5rem;
        background-color: #e74c3c;
        color: #fff;
        border: none;
        border-radius: 50px;
        cursor: pointer;
        font-size: 1.1rem;
        font-weight: bold;
        transition: background-color 0.3s ease, transform 0.2s ease;
    }

    button:hover {
        background-color: #c0392b;
        transform: scale(1.05);
    }

    .status p {
        text-align: center;
        font-size: 1rem;
        color: green;
        margin-top: 1.5rem;
    }

    .product-list {
        max-width: 600px;
        margin: 2rem auto;
        padding: 1rem;
        background-color: #f7f7f7;
        border-radius: 12px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        font-family: 'Roboto', sans-serif;
        color: #333;
    }

    .product-item {
        display: flex;
        align-items: center;
        margin-bottom: 1.5rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 1rem;
        background-color: #fff;
    }

    .product-item img {
        border-radius: 8px;
        margin-right: 1rem;
    }

    h2 {
        text-align: center;
        color: #2c3e50;
        margin-bottom: 1.5rem;
        font-size: 1.5rem;
    }

    button {
        margin-top: 0.5rem;
        padding: 0.5rem 1rem;
        background-color: #3498db;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background-color 0.3s;
    }

    button:hover {
        background-color: #2980b9;
    }
</style>
