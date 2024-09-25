<script>
    import { auth } from '$lib/firebase.js';
    import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
    import { onMount } from "svelte";

    let phoneNumber = "";
    let verificationCode = "";
    let confirmationResult = null;
    let message = "";

   
    onMount(() => {
        window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
            'size': 'invisible',
            'callback': (response) => {
                console.log("reCAPTCHA verified.");
            },
            'expired-callback': () => {
                message = "reCAPTCHA expired, please try again.";
            }
        }, auth);
    });

    const sendVerificationCode = async () => {
        try {
            const appVerifier = window.recaptchaVerifier;
            confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            message = "Verification code sent!";
        } catch (error) {
            message = "Failed to send verification code: " + error.message;
        }
    };

    const verifyCode = async () => {
        try {
            await confirmationResult.confirm(verificationCode);
            message = "Phone number verified successfully!";
        } catch (error) {
            message = "Failed to verify code: " + error.message;
        }
    };
</script>

<div>
    <h1>Phone Authentication</h1>
    <div id="recaptcha-container"></div>

    <div>
        <input type="text" placeholder="Phone Number" bind:value={phoneNumber} />
        <button on:click={sendVerificationCode}>Send Verification Code</button>
    </div>

    <div>
        <input type="text" placeholder="Verification Code" bind:value={verificationCode} />
        <button on:click={verifyCode}>Verify Code</button>
    </div>

    <div>
        <p>{message}</p>
    </div>
</div>
