<script>
    import { goto } from '$app/navigation';

    const faqs = [
        {
            question: "What is Chhito Pasal?",
            answer: "Chhito Pasal is a quick commerce grocery delivery platform that delivers groceries within 10 to 30 minutes."
        },
        {
            question: "How can I place an order?",
            answer: "You can place an order through our website or mobile app by selecting the products you want and proceeding to checkout."
        },
        {
            question: "What is the delivery fee?",
            answer: "The delivery fee is Rs. 20 per order."
        },
        {
            question: "How can I track my order?",
            answer: "You can track your order in real-time on the order tracking page by entering your order ID."
        },
        {
            question: "What payment methods are accepted?",
            answer: "We accept cash on delivery, and you can also pay using popular online payment methods."
        },
        {
            question: "What should I do if I receive a wrong item?",
            answer: "If you receive a wrong item, please contact our support team immediately, and we will resolve the issue."
        },
        {
            question: "Can I change my delivery address after placing an order?",
            answer: "If your order hasn't been dispatched yet, you can contact our support team to change your delivery address."
        },
    ];
</script>

<button on:click={() => goto(`/`)} class="back-button">
    <i class="fa-solid fa-arrow-left"></i> <span>Back</span>
</button>
<div class="faq-container">
    <h1>Frequently Asked Questions</h1>
    <div class="faq-list">
        {#each faqs as { question, answer }}
            <div class="faq-item">
                <h2 class="faq-question">{question}</h2>
                <p class="faq-answer">{answer}</p>
            </div>
        {/each}
    </div>
</div>

<style>
    .back-button {
        padding: 1rem 1rem 0;
        font-size: 1.25rem;
        background-color: transparent;
        border: none;
        color: var(--blue);
        cursor: pointer;
        display: none;
        align-items: center;
    }

    .back-button i {
        margin-right: 1rem;
    }

    .back-button span {
        font-size: 1rem;
        color: #000;
    }

    .faq-container {
        padding: 2rem;
        max-width: 800px;
        margin: 0 auto;
    }

    h1 {
        text-align: center;
        margin-bottom: 2rem;
        color: var(--blue);
    }

    .faq-list {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .faq-item {
        padding: 1.5rem;
        border: 1px solid #eaeaea;
        border-radius: 8px;
        background-color: #f9f9f9;
        transition: background-color 0.3s;
    }

    .faq-item:hover {
        background-color: #f1f1f1;
    }

    .faq-question {
        margin: 0 0 0.5rem;
        font-weight: bold;
    }

    .faq-answer {
        margin: 0;
        color: #555;
    }

    /* media queries */
    @media (max-width: 1200px) {
        .back-button {
            display: flex;
        }
    }
</style>
