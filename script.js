document.addEventListener("DOMContentLoaded", function() {
    const apiKey = "QXUBgWhOzfWcqhL1qBvV8gasrwpDw4P2"; // Replace with your actual API key
    const form = document.getElementById("cityForm");
    const currentWeatherDiv = document.getElementById("currentWeather");
    const dailyForecastsDiv = document.getElementById("dailyForecasts");
    const hourlyForecastsDiv = document.getElementById("hourlyForecasts");
    const errorMessageDiv = document.getElementById("errorMessage");

    form.addEventListener("submit", function(event) {
        event.preventDefault();
        const city = document.getElementById("cityInput").value;
        getWeather(city);
    });

    function getWeather(city) {
        const locationUrl = `https://dataservice.accuweather.com/locations/v1/cities/search?apikey=${apiKey}&q=${city}`;

        fetch(locationUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch location data. Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data && data.length > 0) {
                    const locationKey = data[0].Key;
                    fetchCurrentWeather(locationKey);
                    fetch5DayDailyForecasts(locationKey);
                    fetch1HourHourlyForecasts(locationKey);
                } else {
                    errorMessageDiv.textContent = `City not found: ${city}`;
                    clearWeatherData();
                }
            })
            .catch(error => {
                console.error("Error fetching location data:", error);
                errorMessageDiv.textContent = `Error fetching location data. Please try again later.`;
                clearWeatherData();
            });
    }

    function fetchCurrentWeather(locationKey) {
        const currentConditionsUrl = `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${apiKey}`;

        fetch(currentConditionsUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch current conditions. Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data && data.length > 0) {
                    displayCurrentWeather(data[0]);
                } else {
                    errorMessageDiv.textContent = `No current weather data available.`;
                    clearWeatherData();
                }
            })
            .catch(error => {
                console.error("Error fetching current conditions:", error);
                errorMessageDiv.textContent = `Error fetching current conditions. Please try again later.`;
                clearWeatherData();
            });
    }

    function fetch5DayDailyForecasts(locationKey) {
        const dailyForecastsUrl = `https://dataservice.accuweather.com/forecasts/v1/daily/5day/${locationKey}?apikey=${apiKey}&details=true`;

        fetch(dailyForecastsUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch 5-day daily forecasts. Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data && data.DailyForecasts && data.DailyForecasts.length > 0) {
                    display5DayDailyForecasts(data.DailyForecasts);
                } else {
                    errorMessageDiv.textContent = `No 5-day daily forecasts available.`;
                    clearWeatherData();
                }
            })
            .catch(error => {
                console.error("Error fetching 5-day daily forecasts:", error);
                errorMessageDiv.textContent = `Error fetching 5-day daily forecasts. Please try again later.`;
                clearWeatherData();
            });
    }

    function fetch1HourHourlyForecasts(locationKey) {
        const hourlyForecastsUrl = `https://dataservice.accuweather.com/forecasts/v1/hourly/1hour/${locationKey}?apikey=${apiKey}&details=true`;

        fetch(hourlyForecastsUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch 1-hour hourly forecasts. Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data && data.length > 0) {
                    display1HourHourlyForecasts(data);
                } else {
                    errorMessageDiv.textContent = `No 1-hour hourly forecasts available.`;
                    clearWeatherData();
                }
            })
            .catch(error => {
                console.error("Error fetching 1-hour hourly forecasts:", error);
                errorMessageDiv.textContent = `Error fetching 1-hour hourly forecasts. Please try again later.`;
                clearWeatherData();
            });
    }

    function displayCurrentWeather(data) {
        const temperature = data.Temperature.Metric.Value;
        const weatherText = data.WeatherText;
        const icon = data.WeatherIcon;
        const weatherHtml = `
            <div>
                <p><strong>Temperature:</strong> ${temperature}°C</p>
                <p><strong>Weather:</strong> ${weatherText}</p>
                <img src="https://developer.accuweather.com/sites/default/files/${icon.toString().padStart(2, '0')}-s.png" alt="${weatherText}">
            </div>
        `;
        currentWeatherDiv.innerHTML = weatherHtml;
        clearErrorMessage();
    }

    function display5DayDailyForecasts(dailyForecasts) {
        let forecastsHtml = "";
        dailyForecasts.forEach(forecast => {
            const date = new Date(forecast.Date);
            const day = date.toLocaleDateString("en-US", { weekday: "long" });
            const temperatureMin = forecast.Temperature.Minimum.Value;
            const temperatureMax = forecast.Temperature.Maximum.Value;
            const icon = forecast.Day.Icon;
            forecastsHtml += `
                <div class="forecast-item">
                    <p><strong>${day}</strong></p>
                    <p><strong>Min:</strong> ${temperatureMin}°C</p>
                    <p><strong>Max:</strong> ${temperatureMax}°C</p>
                    <img src="https://developer.accuweather.com/sites/default/files/${icon.toString().padStart(2, '0')}-s.png" alt="">
                </div>
            `;
        });
        dailyForecastsDiv.innerHTML = forecastsHtml;
        clearErrorMessage();
    }

    function display1HourHourlyForecasts(hourlyForecasts) {
        let forecastsHtml = "";
        hourlyForecasts.slice(0, 12).forEach(forecast => {
            const dateTime = new Date(forecast.DateTime);
            const time = dateTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" });
            const temperature = forecast.Temperature.Value;
            const icon = forecast.WeatherIcon;
            forecastsHtml += `
                <div class="forecast-item">
                    <p><strong>${time}</strong></p>
                    <p><strong>Temperature:</strong> ${temperature}°C</p>
                    <img src="https://developer.accuweather.com/sites/default/files/${icon.toString().padStart(2, '0')}-s.png" alt="">
                </div>
            `;
        });
        hourlyForecastsDiv.innerHTML = forecastsHtml;
        clearErrorMessage();
    }

    function clearWeatherData() {
        currentWeatherDiv.innerHTML = "";
        dailyForecastsDiv.innerHTML = "";
        hourlyForecastsDiv.innerHTML = "";
    }

    function clearErrorMessage() {
        errorMessageDiv.textContent = "";
    }
});
