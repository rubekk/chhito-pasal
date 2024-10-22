<script>
    import { onMount } from "svelte";
    import { auth, db } from "$lib/firebaseConfig";
    import {
        GoogleAuthProvider,
        FacebookAuthProvider,
        signInWithPopup,
        onAuthStateChanged,
    } from "firebase/auth";
    import { authStore } from "$lib/store";
    import { doc, getDoc, setDoc } from "firebase/firestore";

    let user = null;
    let phoneNumber = "";
    let phoneConfirmed = false;
    let closePopup = false;

    const googleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            user = result.user;
        } catch (error) {
            console.error("Error during sign-in:", error);
        }
    };

    const facebookSignIn = async () => {
        const provider = new FacebookAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const credential = FacebookAuthProvider.credentialFromResult(result);
            const accessToken = credential.accessToken;

            alert("Logged in with Facebook!");
        } catch (error) {
            console.error("Facebook login failed:", error);
            alert("Error during Facebook login: " + error.message);
        }
    }

    const checkPhoneNumber = async (userId) => {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists() && userDoc.data().phoneNumber) {
            phoneConfirmed = true;
        }
    };

    const confirmPhoneNumber = async () => {
        if (phoneNumber.trim()) {
            phoneConfirmed = true;
            await savePhoneNumberToDatabase(user.uid, phoneNumber);

            closePopup = true;
        }
    };

    const savePhoneNumberToDatabase = async (userId, phoneNumber) => {
        try {
            await setDoc(doc(db, "users", userId), {
                phoneNumber: phoneNumber,
                userId: userId,
                email: user.email,
            });
            console.log("Phone number saved to database.");
        } catch (error) {
            console.error("Error saving phone number:", error);
        }
    };

    onMount(() => {
        onAuthStateChanged(auth, async (currentUser) => {
            user = currentUser;
            authStore.set({
                loggedIn: user != null,
                user,
            });

            if (user) {
                await checkPhoneNumber(user.uid);
            }
        });
    });
</script>

{#if !closePopup}
    <div class="login-popup">
        {#if !user}
            <h1>Chhito<span>Pasal</span></h1>
            <p>Login with Google or Facebook</p>
            <button on:click={googleSignIn}>Google</button>
            <button on:click={facebookSignIn}>Facebook</button>
        {:else if !phoneConfirmed}
            <label for="phone">Enter your phone number:</label>
            <input
                type="text"
                id="phone"
                bind:value={phoneNumber}
                placeholder="Enter phone number"
            />
            <button on:click={confirmPhoneNumber}>Confirm</button>
        {/if}
    </div>
{/if}

<style>
    .login-popup {
        padding: 2rem;
        width: 400px;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }
    
    .login-popup h1 {
        color: var(--blue);
    }

    .login-popup h1 span{
        color: var(--green);
    }

    p {
        margin: 0 0 1rem;
    }

    button {
        margin: .25rem 0;
        padding: 0.5rem 1rem;
        width: 250px;
        height: 40px;
        background-color: var(--blue);
        color: white;
        border: none;
        cursor: pointer;
        border-radius: 5px;
    }

    button:hover {
        background-color: #0056b3;
    }

    label {
        margin-bottom: .25rem;
    }

    input {
        margin-bottom: 1rem;
        padding: 0.5rem;
        width: 250px;
        font-size: 16px;
        background-color: #eaeaea;
        border: 1px solid #ccc;
        border-radius: 3px;
    }
</style>
