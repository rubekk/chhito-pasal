export const getPlaceName = async (latitude, longitude) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`;

    const options = {
        headers: {
            "User-Agent": "Ecom/1.0 (rubekmhzn7@gmail.com)",
        },
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        if (data && data.display_name) {
            return data.display_name;
        } else {
            return "Place not found";
        }
    } catch (error) {
        console.error("Error:", error);
        return "Failed to get a response from the API";
    }
};

export const getTravelDetails = async (start, end, customSpeed) => {
    // haversine
    const toRad = (value) => (value * Math.PI) / 180;

    const R = 6371; 

    const lat1 = start[0];
    const lon1 = start[1];
    const lat2 = end[0];
    const lon2 = end[1];

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const straightLineDistance = R * c;;
    const straightLineDistanceInMeters = straightLineDistance * 1000; 

    if (straightLineDistanceInMeters <= 300) {
        const travelTimeInHours = straightLineDistance / customSpeed; 
        const travelTimeInMinutes = travelTimeInHours * 60; 
        
        return [ straightLineDistance, Math.floor(travelTimeInMinutes) ];
    } 
    else {
    // OSRM
        const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=false&geometries=geojson`;
       
        const response = await fetch(url);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
            const routeDistanceInMeters = data.routes[0].distance;
            const routeDistanceInKm = routeDistanceInMeters / 1000;
            const travelTimeInHours = routeDistanceInKm / customSpeed;
            const travelTimeInMinutes = travelTimeInHours * 60;
            
            return [ routeDistanceInKm, Math.floor(travelTimeInMinutes) ];
        } 
    }
};

