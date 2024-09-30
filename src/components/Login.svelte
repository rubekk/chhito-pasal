<script>
    import { onMount } from "svelte";
    import { auth, db } from "$lib/firebaseConfig";
    import {
        GoogleAuthProvider,
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
            <h1>Chhito, Instant Delivery</h1>
            <p>Login with Google or Facebook</p>
            <button on:click={googleSignIn}>Google</button>
        {:else if !phoneConfirmed}
            <div>
                <label for="phone">Enter your phone number:</label>
                <input
                    type="text"
                    id="phone"
                    bind:value={phoneNumber}
                    placeholder="Enter phone number"
                />
                <button on:click={confirmPhoneNumber}>Confirm</button>
            </div>
        {/if}
    </div>
{/if}

<style>
    .login-popup {
        padding: 1rem 1.5rem;
        width: 500px;
        border: 1px solid #797979;
        text-align: center;
    }

    p {
        margin: 1rem 0 2rem;
    }

    button {
        margin: 0 0.5rem;
        width: 175px;
        height: 40px;
        font-size: 18px;
        color: #797979;
        border: 1px solid #797979;
        border-radius: 3px;
        cursor: pointer;
    }

    input {
        margin-bottom: 1rem;
        padding: 0.5rem;
        width: 250px;
        font-size: 16px;
        border: 1px solid #ccc;
        border-radius: 3px;
    }
</style>
