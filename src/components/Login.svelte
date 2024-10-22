<script>
    import { onMount } from "svelte";
    import { auth, db } from "$lib/firebaseConfig";
    import {
        GoogleAuthProvider,
        createUserWithEmailAndPassword,
        signInWithEmailAndPassword,
        signInWithPopup,
        onAuthStateChanged,
        sendPasswordResetEmail,
    } from "firebase/auth";
    import { authStore, hasPhone } from "$lib/store";
    import { doc, getDoc, setDoc } from "firebase/firestore";

    let user = null;
    let phoneNumber = "";
    let sPhoneConfirmed = false;
    let closePopup = false;
    let email = "";
    let password = "";
    let message = "";
    let forgotPasswordMode = false;

    const registerUser = async () => {
        try {
            const result = await createUserWithEmailAndPassword(
                auth,
                email,
                password,
            );
            user = result.user;
            message = "Registration successful";
        } catch (error) {
            switch (error.code) {
                case "auth/email-already-in-use":
                    message = "This email is already in use.";
                    break;
                case "auth/invalid-email":
                    message = "The email address is not valid.";
                    break;
                case "auth/weak-password":
                    message = "The password is too weak.";
                    break;
                default:
                    message = "Registration failed: " + error.message;
                    break;
            }
        }
    };

    const loginUser = async () => {
        try {
            const result = await signInWithEmailAndPassword(
                auth,
                email,
                password,
            );
            user = result.user;
            message = "Login successful";
        } catch (error) {
            switch (error.code) {
                case "auth/user-not-found":
                    message = "No user found with this email.";
                    break;
                case "auth/wrong-password":
                    message = "Incorrect password. Please try again.";
                    break;
                case "auth/invalid-email":
                    message = "The email address is not valid.";
                    break;
                default:
                    message = "Login failed: " + error.message;
                    break;
            }
        }
    };

    const googleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            user = result.user;
        } catch (error) {
            console.error("Error during sign-in");
        }
    };

    const checkPhoneNumber = async (userId) => {
        const userDoc = await getDoc(doc(db, "users", userId));

        if (userDoc.exists() && userDoc.data().phoneNumber) {
            sPhoneConfirmed = true;
            hasPhone.set(sPhoneConfirmed);
        }
    };

    const confirmPhoneNumber = async () => {
        if (phoneNumber.trim()) {
            sPhoneConfirmed = true;
            hasPhone.set(sPhoneConfirmed);
            closePopup = true;

            await savePhoneNumberToDatabase(user.uid, phoneNumber);
        }
    };

    const savePhoneNumberToDatabase = async (userId, phoneNumber) => {
        try {
            await setDoc(doc(db, "users", userId), {
                phoneNumber: phoneNumber,
                userId: userId,
                email: user.email,
            });
        } catch (error) {
            console.error("Error saving phone number:", error);
        }
    };

    const handleForgotPassword = async () => {
        try {
            await sendPasswordResetEmail(auth, email);
            message = "Password reset email sent!";
            forgotPasswordMode = false;
        } catch (error) {
            message = "Error sending password reset email: " + error.message;
        }
    };

    onMount(() => {
        onAuthStateChanged(auth, async (currentUser) => {
            user = currentUser;

            if (currentUser)
                user.displayName = user.displayName
                    ? user.displayName
                    : user.email
                      ? user.email.split("@")[0].substring(0, 7)
                      : "there";

            authStore.set({
                loggedIn: user != null,
                user,
            });

            hasPhone.set(sPhoneConfirmed);

            if (user) {
                await checkPhoneNumber(user.uid);
            }
        });
    });
</script>

<div class="login-popup">
    {#if forgotPasswordMode}
        <div class="forgot-password-container">
            <p>Enter your email to receive a password reset link:</p>
            <input
                type="email"
                bind:value={email}
                placeholder="Email"
                required
            />
            <button on:click={handleForgotPassword} class="forgot-btn">Send Reset Link</button>
            <button on:click={() => forgotPasswordMode = false} class="forgot-btn">Back</button>
            <p>{message}</p>
        </div>
    {:else}
        {#if !user}
            <div class="form-container">
                <p>Register / Login with email</p>
                <input
                    type="email"
                    bind:value={email}
                    placeholder="Email"
                    required
                />
                <input
                    type="password"
                    bind:value={password}
                    placeholder="Password"
                    required
                />
                <div class="auth-actions">
                    <button on:click={registerUser}>Register</button>
                    <button on:click={loginUser}>Login</button>
                </div>
                <p>{message}</p>
                <p>
                    <span class="forgot-password-text" on:click={() => forgotPasswordMode = true}>Forgot Password?</span>
                </p>
            </div>
            <p>Or</p>
            <button on:click={googleSignIn} class="google-btn">Login with Google</button>
        {:else if !sPhoneConfirmed}
            <label for="phone">Enter your phone number:</label>
            <input
                type="text"
                id="phone"
                bind:value={phoneNumber}
                placeholder="Enter phone number"
            />
            <button on:click={confirmPhoneNumber} class="confirm-btn">Confirm</button>
        {/if}
    {/if}
</div>

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

    .form-container {
        width: 100%;
        border-radius: 8px;
    }

    p {
        margin: 0 0 1rem;
        color: #333;
        text-align: center;
    }

    input {
        width: 100%;
        padding: 0.8rem;
        margin-bottom: 1rem;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    .auth-actions {
        display: flex;
        justify-content: center;
    }

    button {
        color: #fff;
        border: none;
        cursor: pointer;
        border-radius: 5px;
    }

    .form-container button, .forgot-btn {
        margin-right: 0.5rem;
        padding: 0.8rem 1.2rem;
        font-size: 1rem;
        background-color: var(--green);
    }

    .form-container button:hover {
        background-color: green;
    }

    .google-btn,
    .confirm-btn {
        margin: 0.25rem 0;
        padding: 0.5rem 1rem;
        width: 250px;
        height: 40px;
        background-color: var(--blue);
    }

    .google-btn:hover {
        background-color: #0056b3;
    }

    label {
        margin-bottom: 0.25rem;
    }

    .forgot-password-container {
        margin-top: 1rem;
        text-align: center;
    }

    .forgot-password-text {
        color: blue;
        text-decoration: underline;
        cursor: pointer;
    }

    .forgot-password-text:hover {
        color: darkblue;
    }
</style>
