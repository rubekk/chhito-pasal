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
    const routeFactor = 1.5;

    const straightLineDistance = R * c;
    const straightLineDistanceInMeters = straightLineDistance * 1000; 
    
    const travelTimeInHours = straightLineDistance * routeFactor / customSpeed; 
    const travelTimeInMinutes = travelTimeInHours * 60 < 2 ? 5 : travelTimeInHours * 60 + 2; 
    
    return [ straightLineDistance, Math.floor(travelTimeInMinutes) ];
};

