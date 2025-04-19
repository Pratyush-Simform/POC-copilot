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
  const [temperatureUnit, setTemperatureUnit] = useState('metric'); // Default to Celsius

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

  const toggleTemperatureUnit = () => {
    setTemperatureUnit((prevUnit) => (prevUnit === 'metric' ? 'imperial' : 'metric'));
  };

  const getTemperatureUnitSymbol = () => (temperatureUnit === 'metric' ? '°C' : '°F');

  // Function to convert temperature from Celsius to Fahrenheit and vice versa
  const convertTemperature = (temp, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return temp; // No conversion needed

    if (fromUnit === 'metric' && toUnit === 'imperial') {
      return (temp * 9) / 5 + 32; // Celsius to Fahrenheit
    } else if (fromUnit === 'imperial' && toUnit === 'metric') {
      return ((temp - 32) * 5) / 9; // Fahrenheit to Celsius
    }

    throw new Error('Invalid units for temperature conversion');
  };

  // Helper function to convert Celsius to Fahrenheit
  const convertToFahrenheit = (celsius) => (celsius * 9) / 5 + 32;

  // Update displayed temperatures to show °C or °F based on selected unit
  const getTemperatureWithUnit = (temp) => {
    if (temperatureUnit === 'metric') {
      return `${temp}°C`;
    } else {
      return `${convertToFahrenheit(temp)}°F`;
    }
  };

  // Display weather icon using icon code from weatherData.weather[0].icon
  const getWeatherIconUrl = (iconCode) => `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  const fetchWeather = async () => {
    const apiKey = process.env.REACT_APP_WEATHER_API_KEY; // Replace with your OpenWeatherMap API key
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${apiKey}&units=${temperatureUnit}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city},IN&appid=${apiKey}&units=${temperatureUnit}`;

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

  // Function to get card style based on weather condition
  const getCardStyle = (condition) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return { backgroundColor: '#ffe57f' };
      case 'clouds':
        return { backgroundColor: '#cfd8dc' };
      case 'rain':
        return { backgroundColor: '#90caf9' };
      default:
        return { backgroundColor: '#e0e0e0' };
    }
  };

  return (
    <Container maxWidth={false} style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Box textAlign="center" mt={4} className={getBackgroundClass()} style={{ padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', maxWidth: '1200px', margin: '0 auto' }}>
        <Typography variant="h4" gutterBottom style={{ fontWeight: 'bold', color: '#333' }}>
          Weather App
        </Typography>
        <Grid display="block">
        <TextField
          label="Enter city name"
          variant="outlined"
          fullWidth
          value={city}
          onChange={(e) => setCity(e.target.value)}
          margin="normal"
          style={{ marginBottom: '10px', maxWidth: '600px', margin: '0 auto' }}
        />
        <br />
        <br />
        <Button
          variant="contained"
          color="primary"
          onClick={fetchWeather}
          disabled={loading}
          fullWidth
          style={{ marginTop: '10px', marginBottom: '10px', backgroundColor: '#1976d2', color: '#fff', maxWidth: '400px', margin: '0 auto' }}
        >
          {loading ? 'Loading...' : 'Get Weather'}
        </Button>
        </Grid>
        {/* <Button
          variant="contained"
          color="secondary"
          onClick={toggleTemperatureUnit}
          fullWidth
          style={{ backgroundColor: '#ff7043', color: '#fff', maxWidth: '600px', margin: '10px auto' }}
        >
          Toggle to {temperatureUnit === 'metric' ? 'Fahrenheit' : 'Celsius'}
        </Button> */}

        {error && (
          <Typography color="error" mt={2} style={{ marginTop: '20px', color: 'red' }}>
            {error}
          </Typography>
        )}

        {weather && (
          <Card style={{ ...getCardStyle(weather.weather[0].main), marginTop: '20px', borderRadius: '10px', padding: '15px', maxWidth: '600px', margin: '20px auto' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom style={{ fontWeight: 'bold', color: '#333' }}>
                {weather.name}
              </Typography>
              <img
                src={getWeatherIconUrl(weather.weather[0].icon)}
                alt={weather.weather[0].description}
                style={{ width: '80px', height: '80px', marginBottom: '10px' }}
              />
              <Typography style={{ fontSize: '18px', color: '#555' }}>Temperature: {getTemperatureWithUnit(weather.main.temp)}</Typography>
              <Typography style={{ fontSize: '16px', color: '#777' }}>Weather: {weather.weather[0].description}</Typography>
              <Typography style={{ fontSize: '16px', color: '#777' }}>Humidity: {weather.main.humidity}%</Typography>
              <Typography style={{ fontSize: '16px', color: '#777' }}>Wind Speed: {weather.wind.speed} m/s</Typography>
            </CardContent>
          </Card>
        )}

        {forecast.length > 0 && (
          <Box mt={4} style={{ marginTop: '30px', maxWidth: '1200px', margin: '0 auto' }}>
            <Typography variant="h6" gutterBottom style={{ fontWeight: 'bold', color: '#333' }}>
              5-Day Forecast
            </Typography>
            <Grid container spacing={2} display="flex" justifyContent="center">
              {forecast.map((day, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card style={{ borderRadius: '10px', padding: '10px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                    <CardContent>
                      <Typography style={{ fontSize: '16px', fontWeight: 'bold', color: '#555' }}>{new Date(day.dt_txt).toLocaleDateString()}</Typography>
                      <Typography style={{ fontSize: '14px', color: '#777' }}>Temp: {getTemperatureWithUnit(day.main.temp)}</Typography>
                      <Typography style={{ fontSize: '14px', color: '#777' }}>{day.weather[0].description}</Typography>
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
