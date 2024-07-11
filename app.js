document.addEventListener("DOMContentLoaded", function() {
    const apiKey = "QXUBgWhOzfWcqhL1qBvV8gasrwpDw4P2"; // Replace with your actual API key
    const form = document.getElementById("cityForm");
    const weatherDiv = document.getElementById("weather");

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
                    fetchWeatherData(locationKey);
                    fetch5DayDailyForecasts(locationKey);
                } else {
                    weatherDiv.innerHTML = `<p>City not found.</p>`;
                }
            })
            .catch(error => {
                console.error("Error fetching location data:", error);
                weatherDiv.innerHTML = `<p>Error fetching location data. Please try again later.</p>`;
            });
    }

    function fetchWeatherData(locationKey) {
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
                    weatherDiv.innerHTML = `<p>No weather data available.</p>`;
                }
            })
            .catch(error => {
                console.error("Error fetching current conditions:", error);
                weatherDiv.innerHTML = `<p>Error fetching current conditions. Please try again later.</p>`;
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
                    weatherDiv.innerHTML = `<p>No 5-day daily forecasts available.</p>`;
                }
            })
            .catch(error => {
                console.error("Error fetching 5-day daily forecasts:", error);
                weatherDiv.innerHTML = `<p>Error fetching 5-day daily forecasts. Please try again later.</p>`;
            });
    }

    function displayCurrentWeather(data) {
        const temperature = data.Temperature.Metric.Value;
        const weather = data.WeatherText;
        const weatherContent = `
            <h2>Current Weather</h2>
            <p>Temperature: ${temperature}°C</p>
            <p>Weather: ${weather}</p>
        `;
        weatherDiv.innerHTML = weatherContent;
    }

    function display5DayDailyForecasts(dailyForecasts) {
        let forecastContent = '<h2>5-Day Forecast</h2>';
        dailyForecasts.forEach(forecast => {
            const date = new Date(forecast.Date);
            const day = date.toLocaleDateString('en-US', { weekday: 'long' });
            const temperatureMin = forecast.Temperature.Minimum.Value;
            const temperatureMax = forecast.Temperature.Maximum.Value;
            const dayWeather = forecast.Day.IconPhrase;
            const nightWeather = forecast.Night.IconPhrase;
            const dayWeatherIcon = forecast.Day.Icon;
            const nightWeatherIcon = forecast.Night.Icon;

            forecastContent += `
                <div>
                    <p>${day}</p>
                    <p>Min Temperature: ${temperatureMin}°C</p>
                    <p>Max Temperature: ${temperatureMax}°C</p>
                    <p>Day Weather: ${dayWeather}</p>
                    <img src="https://developer.accuweather.com/sites/default/files/${padDigits(dayWeatherIcon, 2)}-s.png" alt="Day Weather Icon">
                    <p>Night Weather: ${nightWeather}</p>
                    <img src="https://developer.accuweather.com/sites/default/files/${padDigits(nightWeatherIcon, 2)}-s.png" alt="Night Weather Icon">
                </div>
            `;
        });

        weatherDiv.insertAdjacentHTML('beforeend', forecastContent);
    }

    // Function to pad digits for weather icons (e.g., 1 becomes 01)
    function padDigits(number, digits) {
        return String(number).padStart(digits, '0');
    }
});
