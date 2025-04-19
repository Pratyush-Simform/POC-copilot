import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Card, CardContent, Typography, Container, Box, Grid } from '@mui/material';
import './App.css';
import ForecastChart from './ForecastChart';

function WeatherApp({ fetchWeatherByCoords }) {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const groupForecastByDate = (forecastList) => {
    const grouped = {};
    forecastList.forEach((entry) => {
      const date = entry.dt_txt.split(' ')[0];
      if (!grouped[date] || entry.dt_txt.includes('12:00:00')) {
        grouped[date] = entry;
      }
    });
    return Object.values(grouped);
  };

  const fetchWeather = async () => {
    const apiKey = process.env.REACT_APP_WEATHER_API_KEY; // Replace with your OpenWeatherMap API key
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city},IN&appid=${apiKey}&units=metric`;

    setLoading(true);
    try {
      const weatherResponse = await axios.get(weatherUrl);
      const forecastResponse = await axios.get(forecastUrl);
      setWeather(weatherResponse.data);
      setForecast(groupForecastByDate(forecastResponse.data.list)); // Group forecast by date
      setError('');
    } catch (err) {
      setWeather(null);
      setForecast([]);
      setError('Could not fetch weather data. Please check the city name.');
    } finally {
      setLoading(false);
    }
  };

  const getBackgroundClass = () => {
    if (!weather) return '';
    const mainWeather = weather.weather[0].main.toLowerCase();
    if (mainWeather.includes('cloud')) return 'bg-cloudy';
    if (mainWeather.includes('sun') || mainWeather.includes('clear')) return 'bg-sunny';
    if (mainWeather.includes('rain')) return 'bg-rainy';
    return 'bg-default';
  };

  return (
    <Container maxWidth="sm">
      <Box textAlign="center" mt={4} className={getBackgroundClass()}>
        <Typography variant="h4" gutterBottom>
          Weather App
        </Typography>
        <TextField
          label="Enter city name"
          variant="outlined"
          fullWidth
          value={city}
          onChange={(e) => setCity(e.target.value)}
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={fetchWeather}
          disabled={loading}
          fullWidth
        >
          {loading ? 'Loading...' : 'Get Weather'}
        </Button>

        {error && (
          <Typography color="error" mt={2}>
            {error}
          </Typography>
        )}

        {weather && (
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {weather.name}
              </Typography>
              <Typography>Temperature: {weather.main.temp}°C</Typography>
              <Typography>Weather: {weather.weather[0].description}</Typography>
              <Typography>Humidity: {weather.main.humidity}%</Typography>
              <Typography>Wind Speed: {weather.wind.speed} m/s</Typography>
            </CardContent>
          </Card>
        )}

        {forecast.length > 0 && (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              5-Day Forecast
            </Typography>
            <Grid container spacing={2}>
              {forecast.map((day, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card>
                    <CardContent>
                      <Typography>{new Date(day.dt_txt).toLocaleDateString()}</Typography>
                      <Typography>Temp: {day.main.temp}°C</Typography>
                      <Typography>{day.weather[0].description}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Box mt={4}>
              <ForecastChart forecast={forecast} />
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
}

function App() {
  const fetchWeatherByCoords = (lat, lon) => {
    console.log(`Fetching weather for coordinates: ${lat}, ${lon}`);
    // Add your API call logic here
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoords(latitude, longitude);
        },
        (error) => {
          console.error('Error getting geolocation:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  return (
    <div className="App">
      <WeatherApp fetchWeatherByCoords={fetchWeatherByCoords} />
    </div>
  );
}

export default App;
