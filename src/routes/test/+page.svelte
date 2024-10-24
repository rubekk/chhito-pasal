<script>
    import { onMount } from 'svelte';

    let resultText = "Your speech will appear here...";
    let isListening = false;
    let recognition;

    onMount(() => {
        // Check if the browser supports the Web Speech API
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            recognition = new SpeechRecognition();

            // Set up recognition options
            recognition.lang = 'en-US';  // Set language (can be changed to other supported languages)
            recognition.interimResults = false;  // If true, get interim results (partial speech)
            recognition.maxAlternatives = 1;  // Number of possible recognition results

            // Capture speech recognition result
            recognition.addEventListener('result', (event) => {
                const speechResult = event.results[0][0].transcript;
                resultText = `You said: "${speechResult}"`;
            });

            // Restart recognition when it's done
            recognition.addEventListener('end', () => {
                isListening = false;  // Enable button again
            });

            // Handle errors
            recognition.addEventListener('error', (event) => {
                resultText = `Error occurred in recognition: ${event.error}`;
                isListening = false;
            });
        } else {
            resultText = "Speech recognition is not supported in this browser.";
        }
    });

    const startListening = () => {
        if (recognition) {
            recognition.start();  // Start listening
            resultText = "Listening...";
            isListening = true;
        }
    };
</script>

<main>
    <h1>Speech to Text Example</h1>

    <!-- Button to start/stop speech recognition -->
    <button on:click={startListening} disabled={isListening}>
        {isListening ? "Listening..." : "Start Listening"}
    </button>

    <!-- Output text here -->
    <p>{resultText}</p>
</main>

<style>
    button {
        font-size: 16px;
        padding: 10px 20px;
        cursor: pointer;
    }

    p {
        font-size: 18px;
        color: #333;
        margin-top: 20px;
    }

    h1 {
        font-size: 24px;
        color: #222;
    }

    main {
        text-align: center;
        margin-top: 50px;
    }
</style>
