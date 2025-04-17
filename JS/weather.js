document.addEventListener("DOMContentLoaded", function () {
    let links = document.querySelectorAll(".nav-link");
    links.forEach(link => {
        if (link.href === window.location.href) {
            link.classList.add("active");
        }
    });
});

// Define regions with their coordinates
const REGIONS = {
    "Tashkent": { latitude: 41.2995, longitude: 69.2401 },
    "Andijan": { latitude: 40.7833, longitude: 72.3500 },
    "Bukhara": { latitude: 39.7686, longitude: 64.4556 },
    "Fergana": { latitude: 40.3864, longitude: 71.7864 },
    "Jizzakh": { latitude: 40.1158, longitude: 67.8422 },
    "Namangan": { latitude: 40.9983, longitude: 71.6726 },
    "Navoi": { latitude: 40.1033, longitude: 65.3733 },
    "Kashkadarya": { latitude: 38.8610, longitude: 65.7890 },
    "Samarkand": { latitude: 39.6542, longitude: 66.9758 },
    "Sirdarya": { latitude: 40.5000, longitude: 68.7000 },
    "Surkhandarya": { latitude: 37.9375, longitude: 67.5781 },
    "Khorezm": { latitude: 41.5500, longitude: 60.6333 },
    "Karakalpakstan": { latitude: 42.4600, longitude: 59.6170 }
};

// Function to get coordinates for the selected region
function getRegionCoordinates() {
    const selectedRegion = localStorage.getItem("selectedRegion") || "Tashkent";
    return REGIONS[selectedRegion] || REGIONS["Tashkent"];
}
// Function to get selected region
function getSelectedRegion() {
    return localStorage.getItem("selectedRegion") || "Tashkent";
}

document.addEventListener("DOMContentLoaded", async function () {
    const openWeather_API = "9579b82edd1fd45c3eecfad101143f85"; // apiKey for OpenWeatherMap
    const weatherAPI = "422dccc4aed14af68e473935251304"; // apiKey from WeatherAPI
    const UNITS = "metric"; // "metric" for Celsius

    // Convert UNIX timestamp to 12-hour format
    function formatTime(timestamp) {
        const date = new Date(timestamp * 1000);
        let hours = date.getHours();
        let minutes = date.getMinutes().toString().padStart(2, "0");
        let ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${ampm}`;
    }

    // Function to update the clock
    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes().toString().padStart(2, "0");
        let ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        
        const formattedTime = `${hours}:${minutes} ${ampm}`;
        document.querySelector("#current-time").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-clock-12">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 0 0 9 9m9 -9a9 9 0 1 0 -18 0"/><path d="M12 7v5l.5 .5"/><path d="M18 15h2a1 1 0 0 1 1 1v1a1 1 0 0 1 -1 1h-1a1 1 0 0 0 -1 1v1a1 1 0 0 0 1 1h2"/>
                <path d="M15 21v-6"/></svg> ${formattedTime}`;
    }
    // Function to synchronize the clock to the next minute
    function syncClockUpdate() {
        updateClock();
        const now = new Date();
        const delay = (60 - now.getSeconds()) * 1000;

        setTimeout(() => {
            updateClock();
            setInterval(updateClock, 60000);
        }, delay);
    }

    // Function to determine day or night
    function getDayOrNight(sunrise, sunset) {
        const currentTime = Math.floor(Date.now() / 1000);
        return currentTime >= sunrise && currentTime < sunset 
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg> Day` 
        : `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg> Night`;
    }

    // Function to capitalize the first letter
    function toTitleCase(str) {
        return str
            .toLowerCase()
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    // Fetch Current Weather Data
    async function fetchCurrentWeather() {
        const City = getSelectedRegion();
        const { latitude, longitude } = getRegionCoordinates();
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${openWeather_API}&units=${UNITS}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();

            if (!data || !data.weather || !data.main) {
                throw new Error("Invalid weather data received");
            }
            
            // Extract data
            const currentDate = new Date();
            const formattedDate = currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            const weatherIcon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
            const weatherDesc = toTitleCase(data.weather[0].description);
            const sunrise = data.sys.sunrise;
            const sunset = data.sys.sunset;
            const dayOrNight = getDayOrNight(sunrise, sunset);
            const temp = Math.round(data.main.temp);
            const humidity = data.main.humidity;
            const windSpeed = Math.round(data.wind.speed * 3.6); // Convert m/s to km/h
            const windDirection = data.wind.deg; // Wind direction in degrees
            const airPressure = data.main.pressure;
            const pressureStatus = getAirPressureStatus(airPressure);
            const precipitationStatus = getPrecipitationStatus(precipitation);
            
            // Append Data to UI
            document.querySelector("#current-date").textContent = `Today (${formattedDate})`;
            document.querySelector("#current-location").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin">
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg> ${City}`;
            document.querySelector("#weather-img").src = weatherIcon;
            document.querySelector("#weather-condition").innerHTML = `${dayOrNight} | ${weatherDesc}`;
            document.querySelector("#temp").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-thermometer">
                <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/></svg> Temperature: ${temp}°C`;
            document.querySelector("#humidity").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-droplets">
                <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/>
                <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/></svg> Humidity: ${humidity}%`;
            document.querySelector("#wind-speed").textContent = `${windSpeed} km/h`;
            document.querySelector("#air-pressure").textContent = `${airPressure} hPa`;
            document.querySelector("#pressure-status").textContent = `${pressureStatus}`;
            document.querySelector("#precipitation-status").textContent = `${precipitationStatus}`;
            document.querySelector("#sunrise-time").textContent = formatTime(sunrise);
            document.querySelector("#sunset-time").textContent = formatTime(sunset);

            // Rotate the compass arrow based on wind direction
            rotateCompass(windDirection);

        } catch (error) {
            console.error("Error fetching current weather:", error);
        }
    }

    // Fetch Sunrise/Sunset Data
    async function fetchSunriseSunset() {
        const { latitude, longitude } = getRegionCoordinates();
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${openWeather_API}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (!data || !data.sys) {
                throw new Error("Invalid sunrise/sunset data received");
            }

            const sunrise = data.sys.sunrise;
            const sunset = data.sys.sunset;
            updateSunMoonIndicator(sunrise, sunset);

        } catch (error) {
            console.error("Error fetching sunrise/sunset data:", error);
        }
    }

    // Update sun/moon indicator & animate movement
    function updateSunMoonIndicator(sunrise, sunset) {
        const currentTime = Math.floor(Date.now() / 1000);
        const sunIndicator = document.querySelector(".sun-indicator");
        const moonIndicator = document.querySelector(".moon-indicator");
        const linePath = document.querySelector(".progress-bar");

        if (!sunIndicator || !moonIndicator || !linePath) {
            console.error("Sun/Moon indicator elements not found");
            return;
        }

        let indicator, startTime, endTime;

        if (currentTime >= sunrise && currentTime < sunset) {
            // Daytime - Show sun indicator
            sunIndicator.style.display = "block";
            moonIndicator.style.display = "none";
            indicator = sunIndicator;
            startTime = sunrise;
            endTime = sunset;
            linePath.style.background = "linear-gradient(to right, yellow, orange)";
        } else {
            // Nighttime - Show moon indicator
            sunIndicator.style.display = "none";
            moonIndicator.style.display = "block";
            indicator = moonIndicator;
            startTime = sunset;
            endTime = sunrise + 86400; // Next day's sunrise
            linePath.style.background = "linear-gradient(to right, #2c3e50, #6c5ce7)";
        }

        // Calculate progress along the line path
        const progress = (currentTime - startTime) / (endTime - startTime);
        animateIndicator(indicator, linePath, progress);
    }

    // Animate sun/moon indicator movement along the .line-path
    function animateIndicator(indicator, linePath, progress) {
        const rect = linePath.getBoundingClientRect();
        const indicatorWidth = indicator.offsetWidth;

        const startX = indicatorWidth / 2;  // Start slightly inside
        const endX = rect.width - indicatorWidth / 2; // Prevent overflow on right side
    
        // Ensure progress is clamped between 0 and 1
        const clampedProgress = Math.max(0, Math.min(1, progress));
    
        // Calculate constrained position
        const positionX = startX + (endX - startX) * clampedProgress;
        
        // Apply transformation to move indicator within bounds
        indicator.style.transform = `translateX(${positionX}px)`;
        indicator.style.transition = "transform 1s ease-out 0.3s";
    }

    // Fetch 24-hour Forecast
    async function fetch24HourForecast() {
        const { latitude, longitude } = getRegionCoordinates();
        const url = `https://api.weatherapi.com/v1/forecast.json?key=${weatherAPI}&q=${latitude},${longitude}&hours=24`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (!data.forecast) throw new Error("Invalid 24-hour forecast data");

            const forecastHours = data.forecast.forecastday[0].hour;
            const currentHour = new Date().getHours();
            
            const forecastContainer = document.querySelector(".hourly-cards");
            forecastContainer.innerHTML = "";

            // Collect forecast data for the next 12-hour intervals
            for (let i = 0; i <= 11; i++) {
                const targetHour = (currentHour + i * 1) % 24;
                const forecast = forecastHours.find(f => new Date(f.time).getHours() === targetHour);
                if (!forecast) continue; 

                const time12hr = new Date(forecast.time)
                    .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });

                // Determine if the forecast time is day or night
                const isDaytime = forecast.is_day === 1;
                
                // Get OpenWeather icon based on WeatherAPI condition code
                const openWeatherIcon = await fetchOpenWeatherIcon(forecast.condition.code, isDaytime);

                forecastContainer.innerHTML += `
                    <li class="hour-box">
                        <h3>${time12hr}</h3>
                        <img src="https:${openWeatherIcon}" alt="Weather">
                        <div class="hour-data">
                            <h4>Temp: ${Math.round(forecast.temp_c)}°C</h4>
                            <h4>Rain: ${forecast.precip_mm} mm</h4>
                        </div>
                    </li>
                `;
            }
        } catch (error) {
            console.error("Error fetching 24-hour forecast:", error);
        }
    }

    // Fetch 7-day Forecast
    async function fetch7DayForecast() {
        const { latitude, longitude } = getRegionCoordinates();
        const url = `https://api.weatherapi.com/v1/forecast.json?key=${weatherAPI}&q=${latitude},${longitude}&days=14`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            if (!data.forecast) throw new Error("Invalid 7-day forecast data");

            const forecastDays = data.forecast.forecastday;
            const forecastContainer = document.querySelector(".daily-cards");
            forecastContainer.innerHTML = "";

            for (const forecast of forecastDays.slice(1, 8)) {
                const dateObj = new Date(forecast.date);
                const dayOfWeek = dateObj.toLocaleDateString("en-US", { weekday: "short" });
                const month = dateObj.toLocaleDateString("en-US", { month: "short" });
                const day = dateObj.getDate();
                const formattedDate = `${dayOfWeek} (${month} ${day})`;

                // Determine if the average condition is more representative of daytime or nighttime
                const isDaytime = new Date().getHours() >= 6 && new Date().getHours() < 18;

                // Fetch OpenWeather icon
                const openWeatherIcon = await fetchOpenWeatherIcon(forecast.day.condition.code, isDaytime);

                forecastContainer.innerHTML += `
                    <li class="day-box">
                        <h3>${formattedDate}</h3>
                        <img src="https:${openWeatherIcon}" alt="Weather Icon">
                        <div class="day-data">
                            <h4>Temp: ${Math.round(forecast.day.avgtemp_c)}°C</h4>
                            <h4>Wind: ${Math.round(forecast.day.maxwind_kph)} km/h</h4>
                            <h4>Humidity: ${forecast.day.avghumidity}%</h4>
                        </div>
                    </li>
                `;

                console.log("Forecast Days:", forecastDays);
            }
        } catch (error) {
            console.error("Error fetching 7-day forecast:", error);
        }
    }

    // Function to map WeatherAPI condition codes to OpenWeather icons
    async function fetchOpenWeatherIcon(weatherAPIConditionCode, isDaytime) {
        const conditionMap = {
            1000: ["01d", "01n"],  // Clear sky
            1003: ["02d", "02n"],  // Partly cloudy
            1006: ["03d", "03n"],  // Cloudy
            1009: ["04d", "04n"],  // Overcast
            1030: ["50d", "50n"],  // Mist
            1063: ["09d", "09n"],  // Patchy rain
            1066: ["13d", "13n"],  // Snow showers
            1069: ["13d", "13n"],  // Sleet
            1072: ["10d", "10n"],  // Freezing drizzle
            1087: ["11d", "11n"],  // Thunderstorms
            1114: ["13d", "13n"],  // Snow blowing
            1117: ["13d", "13n"],  // Blizzard
            1135: ["50d", "50n"],  // Fog
            1147: ["50d", "50n"],  // Freezing fog
            1150: ["09d", "09n"],  // Light drizzle
            1180: ["10d", "10n"],  // Light rain showers
            1183: ["10d", "10n"],  // Moderate rain
            1189: ["10d", "10n"],  // Heavy rain
            1192: ["10d", "10n"],  // Torrential rain
            1210: ["13d", "13n"],  // Light snow
            1213: ["13d", "13n"],  // Moderate snow
            1216: ["13d", "13n"],  // Heavy snow
            1222: ["13d", "13n"],  // Blizzard
            1240: ["09d", "09n"],  // Showers
            1273: ["11d", "11n"],  // Thunderstorm (rain)
            1276: ["11d", "11n"],  // Thunderstorm (severe)
            1282: ["11d", "11n"]   // Thunderstorm (snow)
        };

        const iconCode = conditionMap[weatherAPIConditionCode] ? conditionMap[weatherAPIConditionCode][isDaytime ? 0 : 1] 
        : isDaytime ? "01d" : "01n"; // Default to clear sky

    return `//openweathermap.org/img/wn/${iconCode}@2x.png`;
    }

    // Fetch Precipitation Data
    async function fetchPrecipitation() {
        const { latitude, longitude } = getRegionCoordinates();
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${openWeather_API}&units=${UNITS}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();

            let totalRain = 0;
            for (let i = 0; i < 8; i++) { // Sum up 24 hours of rain data
                totalRain += data.list[i].rain ? data.list[i].rain["3h"] || 0 : 0;
            }

            // Convert to percentage (arbitrary scale)
            const precipitationPercentage = Math.min(100, Math.round((totalRain / 10) * 100));
            
            // Update UI
            document.querySelector("#precipitation").textContent = `${precipitationPercentage}%`;
            document.querySelector("#precipitation-status").textContent = getPrecipitationStatus(totalRain);
        } catch (error) {
            console.error("Error fetching precipitation:", error);
        }
    }
    
    // Function to rotate compass arrow
    function rotateCompass(degrees) {
        const arrow = document.querySelector(".arrow-wrapper");
        if (arrow) {
            arrow.style.transform = `translate(-50%, -50%) rotate(${degrees}deg)`;
        }
    }

    // Function to determine pressure status
    function getAirPressureStatus(pressure) {
        if (pressure < 1000) {
            return "Very low pressure. Expect stormy or unsettled weather!";
        } else if (pressure >= 1000 && pressure < 1015) {
            return "Low pressure. Possible rain, clouds, or unstable weather ahead!";
        } else if (pressure >= 1015 && pressure < 1025) {
            return "Normal pressure. Fair weather with occasional changes!";
        } else if (pressure >= 1025 && pressure < 1040) {
            return "High pressure. Expect clear skies and stable weather!";
        } else if (pressure >= 1040) {
            return "Very high pressure. Expect dry conditions and calm weather!";
        } else {
            return "Invalid pressure data!";
        }
    }

    // Function to determine precipitation status
    function getPrecipitationStatus(totalRain) {
        if (totalRain === 0) {
            return "No precipitation expected. Enjoy clear skies!";
        } else if (totalRain > 0 && totalRain <= 1) {
            return "Light precipitation. Brief drizzles or mild snow possible!";
        } else if (totalRain > 1 && totalRain <= 5) {
            return "Moderate precipitation. Steady rain or snow expected!";
        } else if (totalRain > 5 && totalRain <= 10) {
            return "Heavy precipitation. Significant rain or snow expected!";
        } else {
            return "Severe precipitation. Intense rain or snow expected!";
        }
    }

    // Call function on page load
    await fetchSunriseSunset();
    await fetchCurrentWeather();
    await fetch24HourForecast();
    await fetch7DayForecast();
    await fetchPrecipitation();
    syncClockUpdate();
});