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

// Fetch 12-Hour Soil Temp from Open-Meteo 
async function fetch12HourForecast() {

    // Retrieve the selected region from localStorage (default: Tashkent)
    const selectedRegion = localStorage.getItem("selectedRegion") || "Tashkent";
    const { latitude, longitude } = REGIONS[selectedRegion];

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=soil_temperature_0cm&timezone=auto`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Validate response structure
        if (!data.hourly || !data.hourly.time || !data.hourly.soil_temperature_0cm) {
            throw new Error("Invalid data structure in API response");
        }

        // Convert API timestamps to local time
        const apiTimes = data.hourly.time.map(t => new Date(t));
        const localNow = new Date(); // Current local time

        // Find the index of the nearest future hour
        const startIndex = apiTimes.findIndex(time => time.getHours() >= localNow.getHours());

        // Ensure enough data is available
        if (startIndex === -1 || startIndex + 12 > apiTimes.length) {
            throw new Error("Not enough data available for the next 12 hours");
        }

        // Get the next 12-hour forecast
        const times = apiTimes.slice(startIndex, startIndex + 12);
        let temp = data.hourly.soil_temperature_0cm.slice(startIndex, startIndex + 12);

        // Convert temperature to whole numbers
        temp = temp.map(t => Math.round(t));

        // Format times to AM/PM
        const formattedTimes = times.map(t => 
            new Date(t).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })
        );

        // Update the graph with data
        updateChart(selectedRegion, formattedTimes, temp);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Fetch 7-Day Soil Data (Temp, Moisture) from Open-Meteo 
async function fetch7DayForecast() {
    const selectedRegion = localStorage.getItem("selectedRegion") || "Tashkent";
    const { latitude, longitude } = REGIONS[selectedRegion];

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=soil_temperature_0cm,soil_moisture_0_1cm&timezone=auto`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Validate response structure
        if (!data.hourly || !data.hourly.time || !data.hourly.soil_temperature_0cm || !data.hourly.soil_moisture_0_1cm) {
            throw new Error("Invalid data structure in API response");
        }

        const forecastContainer = document.querySelector(".daily-cards");
        forecastContainer.innerHTML = "";

        const dailyData = processHourlyData(data.hourly);

        dailyData.forEach(({ date, soilTempAvg, soilMoistureAvg }, index) => {
            const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });
            const formattedDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

            const listItem = document.createElement("li");
            listItem.classList.add("day-box");
            listItem.innerHTML = `
                <h4 class="day">${dayOfWeek} (${formattedDate})</h4>
                <h4 class="temp">${soilTempAvg}°C</h4>
                <h4 class="moisture">${soilMoistureAvg}%</h4>
            `;

            // Delay animation for each element
            listItem.style.animationDelay = `${index * 0.2}s`;

            forecastContainer.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error fetching soil forecast:", error);
    }
}

// Process Hourly Data into Daily Averages
function processHourlyData(hourlyData) {
    const { time, soil_temperature_0cm, soil_moisture_0_1cm } = hourlyData;
    const dailyMap = new Map();

    time.forEach((timestamp, index) => {
        const date = new Date(timestamp).toISOString().split("T")[0]; // Extract YYYY-MM-DD

        if (!dailyMap.has(date)) {
            dailyMap.set(date, { tempSum: 0, moistureSum: 0, count: 0 });
        }

        const dailyEntry = dailyMap.get(date);
        dailyEntry.tempSum += soil_temperature_0cm[index];
        dailyEntry.moistureSum += soil_moisture_0_1cm[index] * 100; // Convert moisture to percentage
        dailyEntry.count += 1;
    });

    return Array.from(dailyMap.entries()).map(([date, { tempSum, moistureSum, count }]) => ({
        date: new Date(date),
        soilTempAvg: Math.round(tempSum / count),
        soilMoistureAvg: Math.round(moistureSum / count)
    })).slice(1, 8); // Limit to 7 days
}

// Fetch Solar Radiation from Open-Meteo
async function fetchSolarRadiation() {
    const selectedRegion = localStorage.getItem("selectedRegion") || "Tashkent";
    const { latitude, longitude } = REGIONS[selectedRegion];

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=shortwave_radiation&timezone=auto`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        // Validate response structure
        if (!data.hourly || !data.hourly.time || !data.hourly.shortwave_radiation) {
            throw new Error("Invalid data structure in API response");
        }

        // Get the latest solar radiation value
        const radiationValues = data.hourly.shortwave_radiation;
        const latestRadiation = Math.round(radiationValues[radiationValues.length - 1]);

        // Update the solar radiation element in the dashboard
        document.querySelector(".radiation-value").innerHTML = `${latestRadiation} W/m²</sup>`;
        
        // Set a condition based on radiation level
        const conditionElement = document.querySelector(".radiation-condition span");
        if (latestRadiation < 100) {
            conditionElement.textContent = "Low radiation. Stable weather conditions!";
        } else if (latestRadiation < 300) {
            conditionElement.textContent = "Moderate radiation. Slight weather changes possible!";
        } else {
            conditionElement.textContent = "High radiation. Expect weather changes!";
        }
    } catch (error) {
        console.error("Error fetching solar radiation data:", error);
    }
}

// Funciton to Determine "Extreme Weather" Data
async function fetchExtremeWeather() {
    const selectedRegion = localStorage.getItem("selectedRegion") || "Tashkent";
    const { latitude, longitude } = REGIONS[selectedRegion];

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,wind_speed_10m,precipitation&timezone=auto`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.hourly || !data.hourly.temperature_2m || !data.hourly.wind_speed_10m || !data.hourly.precipitation) {
            throw new Error("Invalid data structure in API response");
        }

        const temps = data.hourly.temperature_2m.slice(0, 12);
        const winds = data.hourly.wind_speed_10m.slice(0, 12);
        const precipitation = data.hourly.precipitation.slice(0, 12);

        updateExtremeWeather(temps, winds, precipitation);
    } catch (error) {
        console.error("Error fetching extreme weather data:", error);
    }
}
function updateExtremeWeather(temps, winds, precipitation) {
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    const maxWind = Math.max(...winds);
    const maxPrecip = Math.max(...precipitation);

    let heatStatus, frostStatus, stormStatus;

    // Heat Status
    if (avgTemp >= 35) {
        heatStatus = "Extreme Heat: Severe heatwave conditions! High risk of wilting and soil dehydration!";
    } else if (avgTemp >= 30) {
        heatStatus = "Moderate Heat: Hot weather persists. Increased evaporation may stress crops!";
    } else if (avgTemp >= 25) {
        heatStatus = "Mild Heat: Warm conditions detected. !";
    } else {
        heatStatus = "Minimal Heat: Slightly higher temperatures, but conditions are stable!";
    }

    // Frost Status
    if (avgTemp <= -5) {
        frostStatus = "Extreme Frost: Severe freezing conditions. High risk of frost damage to crops!";
    } else if (avgTemp <= 0) {
        frostStatus = "Moderate Frost: Freezing temperatures detected. Protect frost-sensitive plants with insulation or covering!";
    } else if (avgTemp <= 5) {
        frostStatus = "Mild Frost: A light frost has set in. Some cold-sensitive crops may experience slight stress!";
    } else {
        frostStatus = "Minimal Frost: Slightly lower temperatures, but no significant frost risk!";
    }

    // Storm Status
    if (maxWind >= 80 || maxPrecip >= 50) {
        stormStatus = "Extreme Storm: Severe storm incoming! High risk of flooding, hail, and infrastructure damage!";
    } else if (maxWind >= 50 || maxPrecip >= 30) {
        stormStatus = "Severe Storm: Heavy rain and strong winds expected!";
    } else if (maxWind >= 30 || maxPrecip >= 15) {
        stormStatus = "Mild Winds: Moderate wind activity - secure lightweight structures!";
    } else {
        stormStatus = "Minimal Winds: Light breeezes, but no significant wind impact!";
    }

    // Update UI
    document.querySelector(".extreme-weather .status-text:nth-child(2)").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" 
    stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-thermometer-sun"><path d="M12 9a4 4 0 0 0-2 7.5"/><path d="M12 3v2"/><path d="m6.6 18.4-1.4 1.4"/><path d="M20 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>
    <path d="M4 13H2"/><path d="M6.34 7.34 4.93 5.93"/></svg> ${heatStatus}`;

    document.querySelector(".extreme-weather .status-text:nth-child(3)").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" 
    stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-thermometer-snowflake"><path d="m10 20-1.25-2.5L6 18"/><path d="M10 4 8.75 6.5 6 6"/><path d="M10.585 15H10"/><path d="M2 12h6.5L10 9"/>
    <path d="M20 14.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z"/><path d="m4 10 1.5 2L4 14"/><path d="m7 21 3-6-1.5-3"/><path d="m7 3 3 6h2"/></svg> ${frostStatus}`;

    document.querySelector(".extreme-weather .status-text:nth-child(4)").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" 
    stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-lightning"><path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/><path d="m13 12-3 5h4l-3 5"/></svg> ${stormStatus}`;
}

// Function to Update Chart with Soil Temp Data
function updateChart(region, times, temp) {
    const canvas = document.getElementById("soilTempChart");
    const ctx = canvas.getContext("2d");

    // Create gradient for line
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, "rgba(0, 132, 255, 0.8)"); // Blue
    gradient.addColorStop(1, "rgba(0, 200, 255, 0.8)"); // Cyan

    new Chart(ctx, {
        type: "line",
        data: {
            labels: times,
            datasets: [{
                label: `Soil Temp (°C) - ${region}`,
                data: temp,
                borderColor: gradient, // Apply gradient color to line
                backgroundColor: "transparent",
                borderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 5,
                pointBackgroundColor: gradient,
                tension: 0.4 // Smooth curve
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {  
                    ticks: { font: { size: 12, weight: "bold"}, color: "#000" } // Keeps hour labels
                },
                y: {
                    min: Math.min(...temp) - 2, // Adjust minimum to keep values centered
                    max: Math.max(...temp) + 2, // Adjust maximum to keep values centered
                    ticks: { font: { size: 12, weight: "bold"}, color: "#000" }, // Keeps hour labels
                    display: false
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }, // Disable default tooltips
                datalabels: {
                    align: "top",
                    anchor: "end",
                    color: "#000",
                    font: { size: 15, weight: "bold" },
                    formatter: value => `${value}°` // Add ° symbol
                }
            }
        },
        plugins: [ChartDataLabels] // Register DataLabels plugin
    });
}

// Fetch all data
document.addEventListener("DOMContentLoaded", async () => {
    await fetch12HourForecast();
    await fetch7DayForecast();
    await fetchSolarRadiation();
    await fetchExtremeWeather();
});