<script>
    import "./app.css"; 
    import Header from "./../components/Header.svelte";
</script>

<Header />
<div class="slot-container">
    <slot />
</div>

<style>
    .slot-container{
        padding: 0 5rem;
    }
</style>