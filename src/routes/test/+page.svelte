<script>
    import { initializeApp } from "firebase/app";
    import { getFirestore, collection, addDoc } from "firebase/firestore";
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

    const handleImageChange = (e) => {
        imageFile = e.target.files[0];
    };

    const uploadProduct = async () => {
        if (!productName || !price || !category || !stock || !imageFile) {
            uploadStatus = "Please fill all fields and select an image.";
            return;
        }

        try {
            // Upload the image to Firebase Storage
            const storageRef = ref(storage, `products/${imageFile.name}`);
            await uploadBytes(storageRef, imageFile);
            const imageUrl = await getDownloadURL(storageRef);

            // Upload product details to Firestore
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
    };
</script>

<!-- Admin Panel UI -->
<div>
    <h1>Admin Panel - Upload Product</h1>

    <div>
        <input type="text" placeholder="Product Name" bind:value={productName} />
    </div>
    <div>
        <input type="number" placeholder="Price" bind:value={price} />
    </div>
    <div>
        <input type="number" placeholder="Discounted Price" bind:value={discountedPrice} />
    </div>
    <div>
        <input type="text" placeholder="Category" bind:value={category} />
    </div>
    <div>
        <input type="number" placeholder="Stock" bind:value={stock} />
    </div>
    <div>
        <input type="file" accept="image/*" on:change={handleImageChange} />
    </div>
    <div>
        <button on:click={uploadProduct}>Upload Product</button>
    </div>

    <div>
        <p>{uploadStatus}</p>
    </div>
</div>

<style>
    input {
        display: block;
        margin-bottom: 1rem;
        padding: 0.5rem;
        font-size: 1rem;
        width: 100%;
    }

    button {
        padding: 0.75rem 1.5rem;
        background-color: #007bff;
        color: white;
        border: none;
        cursor: pointer;
        border-radius: 5px;
    }

    button:hover {
        background-color: #0056b3;
    }

    h1 {
        margin-bottom: 1rem;
    }

    p {
        color: green;
    }
</style>
