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
// Get coordinates of the selected region
function getRegionCoordinates() {
    const selectedRegion = localStorage.getItem("selectedRegion") || "Tashkent";
    return REGIONS[selectedRegion] || REGIONS["Tashkent"];
}

// Define crops with their irrigation needs, planting/harvesting periods, status messages
const CROPS = {
    cotton: { 
        range: "4-7 mm/day", 
        status: "Requires consistent watering for fiber quality!",
        planting: "Apr to May", algo_planting: { start: "04-01", end: "05-31" },
        harvesting: "Sep to Oct", algo_harvesting: { start: "09-01", end: "10-31" },
        thresholds: {
            soilMoisture: { low: 30, high: 60 }, 
            soilTemp: { low: 15, high: 35 }, 
            airTemp: { low: 20, high: 35 }, 
            humidity: { low: 40, high: 80 },
            solarRadiation: { low: 300, high: 800 },
            precipitation: { low: 0.5, high: 10 }
        }
    },
    wheat: { 
        range: "2-6 mm/day", 
        status: "Moderate water required; avoid excessive moisture!",
        planting: "Oct to Nov", algo_planting: { start: "10-01", end: "11-30" },
        harvesting: "June to July", algo_harvesting: { start: "06-01", end: "07-31" },
        thresholds: {
            soilMoisture: { low: 20, high: 50 }, 
            soilTemp: { low: 10, high: 30 }, 
            airTemp: { low: 5, high: 25 }, 
            humidity: { low: 30, high: 70 },
            solarRadiation: { low: 250, high: 700 },
            precipitation: { low: 0.2, high: 8 }
        }
    },
    rice: { 
        range: "8-12 mm/day", 
        status: "Demands high irrigation; keep soil saturated!",
        planting: "May to June", algo_planting: { start: "05-01", end: "06-30" },
        harvesting: "August to Sep", algo_harvesting: { start: "08-01", end: "09-30" },
        thresholds: {
            soilMoisture: { low: 50, high: 90 }, 
            soilTemp: { low: 20, high: 35 }, 
            airTemp: { low: 22, high: 38 }, 
            humidity: { low: 60, high: 90 },
            solarRadiation: { low: 200, high: 600 },
            precipitation: { low: 5, high: 20 }
        }
    },
    apple: { 
        range: "3-6 mm/day", 
        status: "Maintain regular water supply to prevent fruit drop!",
        planting: "March or Nov", algo_planting: [ { start: "03-01", end: "03-31" }, { start: "11-01", end: "11-30" } ],
        harvesting: "August to Oct", algo_harvesting: { start: "08-01", end: "10-31" },
        thresholds: {
            soilMoisture: { low: 35, high: 65 }, 
            soilTemp: { low: 10, high: 30 }, 
            airTemp: { low: 10, high: 30 }, 
            humidity: { low: 40, high: 80 },
            solarRadiation: { low: 200, high: 650 },
            precipitation: { low: 0.5, high: 8 }
        }
    },
    apricot: { 
        range: "3-5 mm/day", 
        status: "Regular irrigation required; avoid overwatering!",
        planting: "Feb to March", algo_planting: { start: "02-01", end: "03-31" },
        harvesting: "June to July", algo_harvesting: { start: "06-01", end: "07-31" },
        thresholds: {
            soilMoisture: { low: 30, high: 60 }, 
            soilTemp: { low: 12, high: 32 }, 
            airTemp: { low: 12, high: 32 }, 
            humidity: { low: 35, high: 75 },
            solarRadiation: { low: 180, high: 650 },
            precipitation: { low: 0.5, high: 8 }
        }
    },
    grapes: { 
        range: "2-4 mm/day", 
        status: "Minimal water needs; avoid excessive moisture!",
        planting: "March to April", algo_planting: { start: "03-01", end: "04-30" },
        harvesting: "July to Sep", algo_harvesting: { start: "07-01", end: "09-30" },
        thresholds: {
            soilMoisture: { low: 20, high: 45 }, 
            soilTemp: { low: 12, high: 35 }, 
            airTemp: { low: 15, high: 35 }, 
            humidity: { low: 30, high: 70 },
            solarRadiation: { low: 250, high: 750 },
            precipitation: { low: 0.5, high: 5 }
        }
    },
    watermelon: { 
        range: "3-5 mm/day", 
        status: "Deep, infrequent watering improves fruit growth!",
        planting: "Apr to May", algo_planting: { start: "04-01", end: "05-31" },
        harvesting: "June to August", algo_harvesting: { start: "06-01", end: "08-31" },
        thresholds: {
            soilMoisture: { low: 25, high: 50 }, 
            soilTemp: { low: 18, high: 35 }, 
            airTemp: { low: 18, high: 35 }, 
            humidity: { low: 30, high: 60 },
            solarRadiation: { low: 250, high: 750 },
            precipitation: { low: 0.5, high: 6 }
        }
    },
    potato: { 
        range: "3-5 mm/day", 
        status: "Avoid overwatering; ensure drainage!",
        planting: "Feb to March", algo_planting: { start: "02-01", end: "03-31" },
        harvesting: "July to Sep", algo_harvesting: { start: "07-01", end: "09-30" },
        thresholds: {
            soilMoisture: { low: 35, high: 60 }, 
            soilTemp: { low: 10, high: 25 }, 
            airTemp: { low: 10, high: 25 }, 
            humidity: { low: 50, high: 85 },
            solarRadiation: { low: 150, high: 600 },
            precipitation: { low: 0.5, high: 8 }
        }
    },
    tomato: { 
        range: "3-6 mm/day", 
        status: "Maintain even moisture levels to prevent cracking!",
        planting: "March to Apr", algo_planting: { start: "03-01", end: "04-30" },
        harvesting: "July to Sep", algo_harvesting: { start: "07-01", end: "09-30" },
        thresholds: {
            soilMoisture: { low: 30, high: 55 }, 
            soilTemp: { low: 12, high: 30 }, 
            airTemp: { low: 12, high: 32 }, 
            humidity: { low: 40, high: 75 },
            solarRadiation: { low: 200, high: 700 },
            precipitation: { low: 0.5, high: 7 }
        }
    }
};
// Get irrigation needs of the selected crop
function getCropIrrigation() {
    const selectedCrop = localStorage.getItem("selectedCrop") || "cotton"; // Default to cotton
    return CROPS[selectedCrop] || CROPS["cotton"];
}

// Update UI with respective details
function updateUI() {
    const { range, status, planting, harvesting } = getCropIrrigation();

    // Update irrigation needs
    document.getElementById("irrigation-need").textContent = range;
    document.getElementById("irrigation-status").textContent = status;

    // Update seasonal conditions
    document.getElementById("planting-season").textContent = planting;
    document.getElementById("harvesting-season").textContent = harvesting;
}

// Retrive thresholds for the selected crop
function getCropThresholds() {
    return getCropIrrigation()?.thresholds || CROPS["cotton"].thresholds;
}

document.addEventListener("DOMContentLoaded", async function () {
    const openWeather_API = "9579b82edd1fd45c3eecfad101143f85"; // apiKey for OpenWeatherMap
    const UNITS = "metric"; // "metric" for Celsius

    // Fetch weather data from OpenWeatherMap
    async function fetchWeatherData(latitude, longitude) {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${openWeather_API}&units=${UNITS}`;
        const response = await fetch(url);
        const data = await response.json();
        if (!data?.list) throw new Error("Invalid weather data received");
        return data;
    }
    // Fetch meteo data from Open-Meteo
    async function fetchMeteoData(latitude, longitude) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=soil_temperature_0cm,soil_moisture_0_1cm,shortwave_radiation&timezone=auto`;
        const response = await fetch(url);
        const data = await response.json();
        if (!data?.hourly?.time) throw new Error("Invalid meteo data received");
        return data;
    }

    // Fetch and process data from both sources
    async function fetchAndProcessData() {
        const { latitude, longitude } = getRegionCoordinates();
        try {
            const [weatherData, meteoData] = await Promise.all([
                fetchWeatherData(latitude, longitude),
                fetchMeteoData(latitude, longitude)
            ]);
            return processWeatherData(meteoData, weatherData);
        } catch (error) {
            console.error("Error fetching data:", error);
            return [];
        }
    }

    function processWeatherData(meteoData, weatherData) {
        let dailyData = {};
    
        // Iterate through hourly timestamps to extract 6 AM and 6 PM values
        meteoData.hourly.time.forEach((timestamp, index) => {
            let date = timestamp.split("T")[0];
            let hour = new Date(timestamp).getHours();
    
            if (!dailyData[date]) {
                dailyData[date] = {
                    soilMoistureMorning: null,
                    soilMoistureEvening: null,
                    soilTempMorning: null,
                    soilTempEvening: null,
                    solarRadiation: 0,
                    solarCount: 0
                };
            }
    
            // Store soil moisture and temperature for 6 AM
            if (hour === 6) {
                dailyData[date].soilMoistureMorning = meteoData.hourly.soil_moisture_0_1cm[index];
                dailyData[date].soilTempMorning = meteoData.hourly.soil_temperature_0cm[index];
            }
    
            // Store soil moisture and temperature for 6 PM
            if (hour === 18) {
                dailyData[date].soilMoistureEvening = meteoData.hourly.soil_moisture_0_1cm[index];
                dailyData[date].soilTempEvening = meteoData.hourly.soil_temperature_0cm[index];
            }
    
            // Accumulate solar radiation for daily average
            dailyData[date].solarRadiation += meteoData.hourly.shortwave_radiation[index];
            dailyData[date].solarCount++;
        });
    
        // Process data into final output
        let processedData = Object.keys(dailyData).map(date => {
            let matchingWeather = weatherData.list.find(item => item.dt_txt.startsWith(date));
    
            // Compute the soil moisture and temperature averages (if both values are available)
            let soilMoistureAvg = (dailyData[date].soilMoistureMorning !== null && dailyData[date].soilMoistureEvening !== null)
                ? (dailyData[date].soilMoistureMorning + dailyData[date].soilMoistureEvening) / 2
                : (dailyData[date].soilMoistureMorning ?? dailyData[date].soilMoistureEvening); // Use single value if only one is available
    
            let soilTempAvg = (dailyData[date].soilTempMorning !== null && dailyData[date].soilTempEvening !== null)
                ? (dailyData[date].soilTempMorning + dailyData[date].soilTempEvening) / 2
                : (dailyData[date].soilTempMorning ?? dailyData[date].soilTempEvening);
    
            return {
                date,
                soilMoisture: soilMoistureAvg ?? 0, // Default to 0 if no data is available
                soilTemp: soilTempAvg ?? 0, // Default to 0 if no data is available
                solarRadiation: dailyData[date].solarCount > 0 ? (dailyData[date].solarRadiation / dailyData[date].solarCount) : 0,
                airTemp: matchingWeather?.main?.temp ?? 0,
                humidity: matchingWeather?.main?.humidity ?? 0,
                precipitation: matchingWeather?.rain?.["3h"] ?? 0
            };
        });
        return processedData;
    }

    // Function to evaluate parameter's status
    function evaluateStatus(value, parameter) {
        const thresholds = getCropThresholds()[parameter];
        if (value <= thresholds.low) return "Increase";
        if (value >= thresholds.high) return "Decrease";
        return "Maintain";
    }

    // Function to evaluate parameter's weightage
    function evaluateWeightedStatus(value, parameter, weight) {
        const thresholds = getCropThresholds()[parameter];
        if (value <= thresholds.low) return -1 * weight; // Increase Irrigation
        if (value >= thresholds.high) return 1 * weight;  // Decrease Irrigation
        return 0; // Maintain Irrigation
    }

    function generateIrrigationAdvice(data) {
        const irrigationList = document.querySelector(".irrigation-cards");
        if (!irrigationList) return;
        irrigationList.innerHTML = "";

        let cumulativeRain = 0;

        data.forEach((day, index) => {
            // Update cumulative rain for past 3 days
            if (index < 3) cumulativeRain += day.precipitation;

            // Get dynamic crop-specific thresholds
            const thresholds = getCropThresholds();

            // Get parameter statuses (for display purposes)
            let soilStatus = evaluateStatus(day.soilMoisture, "soilMoisture");
            let tempStatus = evaluateStatus(day.soilTemp, "soilTemp");
            let radStatus = evaluateStatus(day.solarRadiation, "solarRadiation");
            let airStatus = evaluateStatus(day.airTemp, "airTemp");
            let humStatus = evaluateStatus(day.humidity, "humidity");
            let rainStatus = evaluateStatus(day.precipitation, "precipitation");

            // Assign weighted scores (for overall recommendation)
            let soilMoistureScore = evaluateWeightedStatus(day.soilMoisture, "soilMoisture", 0.35);
            let precipitationScore = evaluateWeightedStatus(day.precipitation, "precipitation", 0.25);
            let airTempScore = evaluateWeightedStatus(day.airTemp, "airTemp", 0.15);
            let soilTempScore = evaluateWeightedStatus(day.soilTemp, "soilTemp", 0.10);
            let humidityScore = evaluateWeightedStatus(day.humidity, "humidity", 0.10);
            let solarRadScore = evaluateWeightedStatus(day.solarRadiation, "solarRadiation", 0.05);
    
            // Calculate total irrigation score
            let totalScore = soilMoistureScore + precipitationScore + airTempScore + 
                             soilTempScore + humidityScore + solarRadScore;
            
            // Prevent irrigation if it rained heavily in last 24 hours
            if (day.precipitation >= thresholds.precipitation.high) {
                totalScore = 1; // Force "Decrease"
            }
            // Prevent irrigation if cumulative rain in last 3 days is high
            if (index === 0 && cumulativeRain >= thresholds.precipitation.high * 1.5) {
                totalScore = 1; // Force "Decrease"
            }

            // Determine irrigation recommendation based on total score
            let overallAdvice = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-equal-icon lucide-circle-equal"><path d="M7 10h10"/><path d="M7 14h10"/><circle cx="12" cy="12" r="10"/></svg> Maintain`;
            if (totalScore < -0.3) { 
                overallAdvice = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-plus-icon lucide-circle-plus"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg> Increase`;
            } else if (totalScore > 0.3) { 
                overallAdvice = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-minus-icon lucide-circle-minus"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg> Decrease`;
            }

            // Convert date to the format
            const dateObj = new Date(day.date);
            const formattedDate = `${dateObj.toLocaleDateString("en-US", { weekday: "short" })} (${dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`;

            let irrigationItem = `
                <li class="irrigation-box">
                    <h3>${formattedDate}</h3>
                    <div class="irrigation-data">
                        <h4>Soil Mois: ${day.soilMoisture.toFixed(0)}% (${soilStatus})</h4>
                        <h4>Soil Temp: ${day.soilTemp.toFixed(0)}°C (${tempStatus})</h4>
                        <h4>Solar Rad: ${day.solarRadiation.toFixed(0)} W/m² (${radStatus})</h4>
                        <h4>Air Temp: ${day.airTemp.toFixed(0)}°C (${airStatus})</h4>
                        <h4>Humidity: ${day.humidity.toFixed(0)}% (${humStatus})</h4>
                        <h4>Rain: ${day.precipitation.toFixed(1)} mm (${rainStatus})</h4>
                    </div>
                    <div class="overall-advice">
                        <h4>Irrigation: ${overallAdvice}</h4>
                    </div>
                </li>
            `;
            irrigationList.innerHTML += irrigationItem;
        });
    }
    // Fetch and generate irrigation advice
    const data = await fetchAndProcessData();
    generateIrrigationAdvice(data);


    // Function to get planting period for the selected crop
    function getPlantingPeriod() {
        const selectedCrop = localStorage.getItem("selectedCrop") || "cotton";
        return CROPS[selectedCrop]?.algo_planting || null;
    }

    async function fetchAndEvaluatePlantingConditions() {
        const { latitude, longitude } = getRegionCoordinates();
        const cropThresholds = getCropThresholds();
    
        try {
            // Fetch data from both APIs
            const [weatherData, meteoData] = await Promise.all([
                fetchWeatherData(latitude, longitude),
                fetchMeteoData(latitude, longitude)
            ]);
    
            // Process data into daily format
            const dailyData = processWeatherData(meteoData, weatherData);
    
            // Evaluate planting conditions
            evaluatePlantingSuitability(dailyData, cropThresholds);
        } catch (error) {
            console.error("Error fetching weather data:", error);
        }
    }

    // Function to evaluate planting
    function evaluatePlantingSuitability(dailyData, thresholds) {
        const tableBody = document.querySelector(".planting-week");
        tableBody.innerHTML = ""; // Clear existing table rows

        const plantingPeriod = getPlantingPeriod();
    
        dailyData.forEach(day => {
            let suitabilityClass = "";
            let suitabilityMessage = "";
    
            const { soilTemp, soilMoisture, solarRadiation, airTemp, precipitation } = day;
            const dateObj = new Date(day.date);
            const currentMonthDay = dateObj.toISOString().slice(5, 10); // Format as MM-DD
            const formattedDate = `${dateObj.toLocaleDateString("en-US", { weekday: "short" })} (${dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`;
    
            // Check if the date falls within the planting season
            let isWithinPlantingSeason = false;

            if (Array.isArray(plantingPeriod)) {
                // If multiple planting periods exist
                isWithinPlantingSeason = plantingPeriod.some(period => 
                    currentMonthDay >= period.start && currentMonthDay <= period.end
                );
            } else {
                // Single planting period
                isWithinPlantingSeason = currentMonthDay >= plantingPeriod.start && currentMonthDay <= plantingPeriod.end;
            }

            // If it's not the planting season, mark as "Not season"
            if (!isWithinPlantingSeason) {
                suitabilityClass = "not-season";
                suitabilityMessage = "Not season";
            } else {
                // Compare values against crop thresholds
                const withinSoilMoisture = soilMoisture >= thresholds.soilMoisture.low && soilMoisture <= thresholds.soilMoisture.high;
                const withinSoilTemp = soilTemp >= thresholds.soilTemp.low && soilTemp <= thresholds.soilTemp.high;
                const withinAirTemp = airTemp >= thresholds.airTemp.low && airTemp <= thresholds.airTemp.high;
                const withinSolarRadiation = solarRadiation >= thresholds.solarRadiation.low && solarRadiation <= thresholds.solarRadiation.high;
                const withinPrecipitation = precipitation >= thresholds.precipitation.low && precipitation <= thresholds.precipitation.high;
    
                // Determine planting suitability
                if (withinSoilMoisture && withinSoilTemp && withinAirTemp && withinSolarRadiation && withinPrecipitation) {
                    suitabilityClass = "ideal";
                    suitabilityMessage = "Perfect for planting";
                } else if (withinSoilMoisture && withinSoilTemp && withinAirTemp) {
                    suitabilityClass = "good";
                    suitabilityMessage = "Good conditions";
                } else if (!withinSoilMoisture && soilMoisture < thresholds.soilMoisture.low) {
                    suitabilityClass = "too-dry";
                    suitabilityMessage = "Too dry, irrigation needed";
                } else if (soilMoisture > thresholds.soilMoisture.high) {
                    suitabilityClass = "too-wet";
                    suitabilityMessage = "Too wet, risk of root rot";
                } else if (!withinPrecipitation && precipitation > thresholds.precipitation.high) {
                    suitabilityClass = "rain-expected";
                    suitabilityMessage = "Rain expected, delay planting";
                } else if (airTemp > thresholds.airTemp.high) {
                    suitabilityClass = "heat-stress";
                    suitabilityMessage = "Too hot, risk of heat damage";
                } else if (airTemp < thresholds.airTemp.low) {
                    suitabilityClass = "cold-risk";
                    suitabilityMessage = "Too cold, slow germination";
                } else {
                    suitabilityClass = "poor";
                    suitabilityMessage = "Poor conditions";
                }
            }
        
            // Append new row to planting table
            const row = `<tr>
                <td>${formattedDate}</td>
                <td>${soilTemp.toFixed(0)}°C</td>
                <td>${soilMoisture.toFixed(0)}%</td>
                <td>${airTemp.toFixed(0)}°C</td>
                <td>${precipitation.toFixed(1)} mm</td>
                <td class="${suitabilityClass}">${suitabilityMessage}</td>
            </tr>`;
            tableBody.innerHTML += row;
        });
    }

    // Function to get harvesting period for the selected crop
    function getHarvestingPeriod() {
        const selectedCrop = localStorage.getItem("selectedCrop") || "cotton";
        return CROPS[selectedCrop]?.algo_harvesting || null;
    }

    // Function to fetch and evaluate harvesting conditions
    async function fetchAndEvaluateHarvestingConditions() {
        const { latitude, longitude } = getRegionCoordinates();
        const cropThresholds = getCropThresholds();

        try {
            // Fetch data from both APIs
            const [weatherData, meteoData] = await Promise.all([
                fetchWeatherData(latitude, longitude),
                fetchMeteoData(latitude, longitude)
            ]);

            // Process data into daily format
            const dailyData = processWeatherData(meteoData, weatherData);

            // Evaluate harvesting conditions
            evaluateHarvestingSuitability(dailyData, cropThresholds);
        } catch (error) {
            console.error("Error fetching weather data:", error);
        }
    }

    // Function to evaluate harvesting suitability
    function evaluateHarvestingSuitability(dailyData, thresholds) {
        const tableBody = document.querySelector(".harvesting-week");
        tableBody.innerHTML = ""; // Clear existing table rows

        const harvestingPeriod = getHarvestingPeriod();

        dailyData.forEach(day => {
            let suitabilityClass = "";
            let suitabilityMessage = "";

            const { soilTemp, soilMoisture, solarRadiation, airTemp, precipitation } = day;
            const dateObj = new Date(day.date);
            const currentMonthDay = dateObj.toISOString().slice(5, 10); // Format as MM-DD
            const formattedDate = `${dateObj.toLocaleDateString("en-US", { weekday: "short" })} (${dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`;

            // Check if the date falls within the harvesting season
            const isWithinHarvestingSeason = currentMonthDay >= harvestingPeriod.start && currentMonthDay <= harvestingPeriod.end;

            // If it's not the harvesting season, mark as "Not season"
            if (!isWithinHarvestingSeason) {
                suitabilityClass = "not-season";
                suitabilityMessage = "Not season";
            } else {
                // Compare values against crop thresholds
                const withinSoilMoisture = soilMoisture >= thresholds.soilMoisture.low && soilMoisture <= thresholds.soilMoisture.high;
                const withinSoilTemp = soilTemp >= thresholds.soilTemp.low && soilTemp <= thresholds.soilTemp.high;
                const withinAirTemp = airTemp >= thresholds.airTemp.low && airTemp <= thresholds.airTemp.high;
                const withinSolarRadiation = solarRadiation >= thresholds.solarRadiation.low && solarRadiation <= thresholds.solarRadiation.high;
                const withinPrecipitation = precipitation >= thresholds.precipitation.low && precipitation <= thresholds.precipitation.high;

                // Determine harvesting suitability
                if (withinSoilMoisture && withinSoilTemp && withinAirTemp && withinSolarRadiation && withinPrecipitation) {
                    suitabilityClass = "ideal";
                    suitabilityMessage = "Perfect for harvesting";
                } else if (withinSoilMoisture && withinSoilTemp && withinAirTemp) {
                    suitabilityClass = "good";
                    suitabilityMessage = "Good conditions";
                } else if (!withinSoilMoisture && soilMoisture < thresholds.soilMoisture.low) {
                    suitabilityClass = "too-dry";
                    suitabilityMessage = "Too dry, potential yield loss";
                } else if (soilMoisture > thresholds.soilMoisture.high) {
                    suitabilityClass = "too-wet";
                    suitabilityMessage = "Too wet, risk of damage";
                } else if (!withinPrecipitation && precipitation > thresholds.precipitation.high) {
                    suitabilityClass = "rain-expected";
                    suitabilityMessage = "Rain expected, delay harvesting";
                } else if (airTemp > thresholds.airTemp.high) {
                    suitabilityClass = "heat-stress";
                    suitabilityMessage = "Too hot, risk of spoilage";
                } else if (airTemp < thresholds.airTemp.low) {
                    suitabilityClass = "cold-risk";
                    suitabilityMessage = "Too cold, risk of frost damage";
                } else {
                    suitabilityClass = "poor";
                    suitabilityMessage = "Poor conditions";
                }
            }

            // Append new row to harvesting table
            const row = `<tr>
                <td>${formattedDate}</td>
                <td>${soilTemp.toFixed(0)}°C</td>
                <td>${soilMoisture.toFixed(0)}%</td>
                <td>${airTemp.toFixed(0)}°C</td>
                <td>${precipitation.toFixed(1)} mm</td>
                <td class="${suitabilityClass}">${suitabilityMessage}</td>
            </tr>`;
            tableBody.innerHTML += row;
        });
    }
    // Call functions on page load
    updateUI();
    fetchAndEvaluatePlantingConditions();
    fetchAndEvaluateHarvestingConditions();
});