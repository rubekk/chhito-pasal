<script>
    const email = "support@chhitopasal.com"; // Replace with your actual support email
    const phoneNumber = "+977 123-456-7890"; // Replace with your actual phone number
</script>

<footer class="footer">
    <div class="footer-content">
        <div class="footer-item">
            <strong>Email:</strong> <a href="mailto:{email}">{email}</a>
        </div>
        <div class="footer-item">
            <strong>Phone:</strong> <a href="tel:{phoneNumber}">{phoneNumber}</a>
        </div>
        <div class="footer-item">
            <strong><a href="/faq">FAQ</a></strong>
        </div>
    </div>
</footer>

<style>
    .footer {
        background-color: #f9f9f9; /* Light background color to match the parent */
        padding: 1rem 0; /* Padding for top and bottom */
        border-top: 1px solid #eaeaea; /* Top border for separation */
    }

    .footer-content {
        display: flex;
        justify-content: center; /* Center the content */
        align-items: center; /* Center vertically */
        gap: 2rem; /* Space between items */
        max-width: 1200px; /* Limit the maximum width */
        margin: 0 auto; /* Center the footer on the page */
    }

    .footer-item {
        display: flex;
        align-items: center; /* Center items vertically */
        font-size: 1rem; /* Font size */
        color: #333; /* Text color */
    }

    .footer-item a {
        color: var(--blue); /* Theme color for links */
        text-decoration: none; /* Remove underline */
        margin-left: 0.5rem; /* Space between label and link */
        transition: color 0.2s; /* Transition for hover effect */
    }

    .footer-item a:hover {
        color: var(--dark-blue); /* Darker shade on hover */
    }

    strong {
        margin-right: 0.5rem; /* Space between strong and text */
    }
</style>
