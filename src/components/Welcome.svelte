<script>
    import { fade } from "svelte/transition";

    let runTransition = false;

    setTimeout(() => {
        runTransition = true;
    }, 100);
</script>

{#if runTransition}
    <div class="welcome-container" transition:fade={{ duration: 1000 }}>
        <h1>Chitto<span>Pasal</span></h1>
        <p>Groceries delivered instantly</p>
    </div>
{/if}

<style>
    .welcome-container {
        width: 100%;
        height: 100vh;
        background: linear-gradient(90deg, #a8e6cf, #dcedf7);
        display: flex;
        justify-content: center;
        flex-direction: column;
    }
    .welcome-container h1 {
        margin: 0 auto;
        width: max-content;
        font-size: 2.5rem;
        color: var(--blue);
    }
    .welcome-container h1 span {
        color: var(--green);
    }
    .welcome-container p {
        margin: 0 auto;
        width: max-content;
    }
</style>
