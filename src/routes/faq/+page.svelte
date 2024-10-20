<script>
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
    .faq-container {
        padding: 2rem;
        max-width: 800px; /* Max width for the content */
        margin: 0 auto; /* Center the content */
    }

    h1 {
        text-align: center; /* Center the FAQ title */
        margin-bottom: 2rem; /* Space below the title */
        color: var(--blue); /* Use your theme color */
    }

    .faq-list {
        display: flex;
        flex-direction: column;
        gap: 1.5rem; /* Space between FAQ items */
    }

    .faq-item {
        padding: 1.5rem;
        border: 1px solid #eaeaea; /* Light border for each FAQ item */
        border-radius: 8px; /* Rounded corners */
        background-color: #f9f9f9; /* Light background color */
        transition: background-color 0.3s;
    }

    .faq-item:hover {
        background-color: #f1f1f1; /* Slightly darker on hover */
    }

    .faq-question {
        margin: 0 0 0.5rem; /* Space below question */
        font-weight: bold; /* Bold for questions */
    }

    .faq-answer {
        margin: 0; /* No margin for answers */
        color: #555; /* Answer text color */
    }
</style>
