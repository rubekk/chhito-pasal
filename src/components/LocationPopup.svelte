<script>
    import { onMount, tick } from "svelte";
    import { browser } from "$app/environment";
    import { storeLocation, userLocation } from "$lib/store";
    import { getPlaceName, getTravelDetails } from "$lib/utils";

    let sStoreLocation = [];
    let sUserLocation = {
        coords: [],
        place: "",
        distance: 0,
        deliveryTime: 0,
        deliveryAvailable: false,
    };
    let leaflet;
    let map;
    let marker = null;
    let showMap = false;
    let mapElem;
    let mapCoords = [];
    let isLocationSelected = false;
    let geoErrorMessage = "";
    let clickedPlaceName = "";

    storeLocation.subscribe((value) => {
        sStoreLocation = value;
    });

    const getGeoLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const [lat, lng] = [
                        position.coords.latitude,
                        position.coords.longitude,
                    ];
                    confirmLocation(lat, lng);
                    geoErrorMessage = "";
                },
                (error) => {
                    geoErrorMessage =
                        "Unable to retrieve your location. Please choose the location manually";
                },
            );
        } else {
            geoErrorMessage = "Geolocation is not supported by this browser.";
        }
    };

    const handleMap = async () => {
        geoErrorMessage = "";
        showMap = true;
        await tick();

        map = leaflet
            .map(mapElem, { zoomControl: true })
            .setView([27.700001, 85.333336], 13);
        leaflet
            .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
            .addTo(map);

        map.on("click", async (e) => {
            mapCoords = [e.latlng.lat, e.latlng.lng];

            if (marker) marker.setLatLng([mapCoords[0], mapCoords[1]]);
            else
                marker = leaflet
                    .marker([mapCoords[0], mapCoords[1]])
                    .addTo(map);

            isLocationSelected = true;
            clickedPlaceName = await getPlaceName(mapCoords[0], mapCoords[1]);
        });
    };

    const confirmLocation = async (lat, lng) => {
        sUserLocation.coords = [lat, lng];
        sUserLocation.place = await getPlaceName(lat, lng);

        const [distance, time] = await getTravelDetails(
            sStoreLocation,
            sUserLocation.coords,
            8,
        );

        sUserLocation.distance = distance;
        sUserLocation.deliveryTime = sUserLocation.distance < 1.5 ? time : " - ";
        sUserLocation.deliveryAvailable = sUserLocation.distance < 1.5;

        localStorage.setItem("geoCoords", sUserLocation.coords);

        userLocation.set(sUserLocation);
    };

    onMount(async () => {
        if (browser) {
            leaflet = await import("leaflet");
        }
    });
</script>

<div class="location-popup">
    <h2>Select Delivery Location</h2>
    <button on:click={getGeoLocation}>Get Current Location</button>
    <button on:click={handleMap}>Type Location Manually</button>

    {#if geoErrorMessage}
        <p class="error-message">{geoErrorMessage}</p>
    {/if}

    {#if showMap}
        <div class="map-container">
            <div bind:this={mapElem} id="map" class="map"></div>
            <div class="place-info">
                {#if clickedPlaceName}
                    <p class="place-name">{clickedPlaceName}</p>
                {/if}
                {#if isLocationSelected}
                    <button
                        class="confirm-btn"
                        on:click={() =>
                            confirmLocation(mapCoords[0], mapCoords[1])}
                        >Confirm Location</button
                    >
                {/if}
            </div>
        </div>
    {/if}
</div>

<style>
    @import "leaflet/dist/leaflet.css";

    .location-popup {
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

    .location-popup h2{
        margin-bottom: 1rem;
    }

    button {
        margin: .25rem 0;
        padding: 0.5rem 1rem;
        width: 250px;
        height: 40px;
        background-color: var(--blue);
        color: white;
        border: none;
        cursor: pointer;
        border-radius: 5px;
    }

    button:hover {
        background-color: #0056b3;
    }

    .map-container {
        width: 100%;
        margin-top: 1rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .map {
        width: 100%;
        height: 350px;
    }

    .place-info {
        margin: 1rem 0.5rem 0;
        font-size: 0.9rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .confirm-btn {
        padding: 0.5rem 2rem;
        width: max-content;
        background-color: var(--green);
        color: white;
        border: none;
        border-radius: 5px;
        z-index: 1000;
        position: absolute;
        top: 31rem;
        left: 50%;
        right: 50%;
        transform: translateX(-50%);
    }

    .confirm-btn:hover {
        background-color: #218838;
    }

    .error-message {
        color: red;
        margin: 1rem 0;
    }
</style>
