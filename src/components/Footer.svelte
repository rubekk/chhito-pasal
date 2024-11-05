<script>
    const email = "chittopasal@gmail.com";
    const phoneNumber = "+977 9745706122";
</script>

<footer class="footer">
    <div class="footer-content">
        <div class="footer-item">
            <strong><a href="/faq">FAQ</a></strong>
        </div>
        <div class="footer-item">
            <strong>Email:</strong> <a href="mailto:{email}">{email}</a>
        </div>
        <div class="footer-item">
            <strong>Phone:</strong> <a href="tel:{phoneNumber}">{phoneNumber}</a>
        </div>
    </div>
</footer>

<style>
    .footer {
        padding: 3rem 0 1rem;
    }

    .footer-content {
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
        max-width: 1200px;
        margin: 0 auto;
    }

    .footer-item {
        display: flex;
        align-items: center;
        font-size: 1rem;
        color: #333;
    }

    .footer-item a {
        color: var(--blue);
        text-decoration: none;
        margin-left: 0.5rem;
        transition: color 0.2s;
    }

    .footer-item a:hover {
        color: var(--dark-blue);
    }

    strong {
        margin-right: 0.5rem; 
    }

    /* media queries */
    @media (max-width: 700px) {
        .footer-content {
            flex-direction: column;
        }
    }
</style>
