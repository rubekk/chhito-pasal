<script>
    import { onMount, tick } from "svelte"; 
    import { browser } from '$app/environment';
    import { userLocation } from "$lib/store";
    import { getPlaceName, getTravelDetails } from "$lib/utils";

    const storeLatLng = [27.665322, 85.330719];

    let sUserLocation = {
        coords: [],
        place: "",
        distance: 0,
        deliveryTime: 0
    };
    let leaflet; 
    let map;
    let marker = null;
    let showMap = false;
    let mapElem;
    let mapCoords = [];
    let isLocationSelected = false; 

    const getGeoLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {       
                const [ lat, lng ] = [ position.coords.latitude, position.coords.longitude ];         
                
                confirmLocation(lat, lng);
            });
        }
    }

    const handleMap = async () => {
        showMap = true;
        await tick();

        map = leaflet.map(mapElem, { zoomControl: true }).setView([27.700001, 85.333336], 13);
        leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        map.on('click', e => {
            mapCoords = [ e.latlng.lat, e.latlng.lng ];

            if (marker) marker.setLatLng([mapCoords[0], mapCoords[1]]); 
            else  marker = leaflet.marker([mapCoords[0], mapCoords[1]]).addTo(map);

            isLocationSelected = true;
        });
    }

    const handleConfirmLocation = () => {
        confirmLocation(mapCoords[0], mapCoords[1])
    }

    const confirmLocation = async (lat, lng) => {
        sUserLocation.coords = [lat, lng];
        sUserLocation.place = await getPlaceName(lat, lng);

        const [ distance, time ] = await getTravelDetails(storeLatLng, sUserLocation.coords, 10);

        sUserLocation.distance = distance;
        sUserLocation.deliveryTime = time;

        userLocation.set(sUserLocation);
    };

    onMount(async () => {
        if (browser) {
            leaflet = await import('leaflet');
        }
    });
</script>

<div class="location-popup">
    <h2>Select Delivery Location</h2>
    <button on:click={getGeoLocation}>Get Current Location</button>
    <button on:click={handleMap}>Type Location Manually</button>

    {#if showMap}
    <div class="map-fullscreen">
        <div bind:this={mapElem} id="map" class="map-container"></div>

        {#if isLocationSelected}
        <button class="confirm-btn" on:click={handleConfirmLocation}>Confirm Location</button>
        {/if}
    </div>
    {/if}
</div>

<style>
    @import 'leaflet/dist/leaflet.css';

    .location-popup {
        padding: 1rem;
        width: 370px;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    button {
        margin: 1rem 0;
        padding: 0.5rem 1rem;
        background-color: #007bff;
        color: white;
        border: none;
        cursor: pointer;
        border-radius: 5px;
    }

    button:hover {
        background-color: #0056b3;
    }

    .map-fullscreen {
        width: 100%;
        height: 350px;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: white;
    }

    .map-container {
        width: 100%;
        height: 100%;
    }

    .confirm-btn {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        padding: 0.5rem 2rem;
        background-color: #28a745;
        color: white;
        border: none;
        cursor: pointer;
        border-radius: 5px;
        z-index: 1000;
    }

    .confirm-btn:hover {
        background-color: #218838;
    }
</style>
