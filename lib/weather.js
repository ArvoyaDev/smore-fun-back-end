const axios = require('axios');
const dotenv = require('dotenv');
let cache = require('../cache');
dotenv.config();

const WEATHER_API = process.env.WEATHER_API_KEY;
const US_States=["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
	"HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
	"MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
	"NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
	"SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"]

class Forecast {
	constructor(date, imgCode, temp, description, stateCode, lat, lon) {
		this.date = this.formatDate(date);
		this.img = `https://www.weatherbit.io/static/img/icons/${imgCode}.png`;
		this.temp = temp;
		this.description = description;
		this.stateCode = stateCode;
		this.lat = lat;
		this.lon = lon
	}

	formatDate(inputDate) {
		const parsedDate = new Date(inputDate);
		return `${parsedDate.toLocaleDateString('en-US', {month: 'numeric', day: 'numeric' })}`;
	}
}

const isCacheExpired = (cacheWeatherData) => {
	const cacheTimestamp = cacheWeatherData.timestamp;
	const currentTime = Date.now();
	const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

	return (currentTime - cacheTimestamp) > oneDayInMilliseconds;
}

const weatherHandler = async (request, response) => {
	const { city } = request.query;
	let weather = `${city} Weather`

	if(cache[weather] && !isCacheExpired(cache[weather])){
		return cache[weather].data;
	} else {
		try {
			const weatherResponse = await axios.get(`https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${WEATHER_API}&include=minutely`);
			const stateCode = weatherResponse.data.state_code; // Get the state code
			const lat = weatherResponse.data.lat
			const lon = weatherResponse.data.lon

			if (!US_States.includes(stateCode)) {
				// If not, return an error object
				return { error: 'Invalid state code. This service only works for US locations.' };
			}


			let weatherData = weatherResponse.data.data.map((element) => new Forecast(element.datetime, element.weather.icon, element.temp, element.weather.description, stateCode, lat, lon)); // Pass the state code to the Forecast constructor
			// Filter out the incorrect date
			let currentDate = new Date();
			weatherData = weatherData.filter(forecast => {
				let forecastDate = new Date(forecast.date);
				let currentDateUTC = Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
				let forecastDateUTC = Date.UTC(forecastDate.getFullYear(), forecastDate.getMonth(), forecastDate.getDate());
				return forecastDateUTC !== currentDateUTC;
			});

			cache[weather] = {
				data: weatherData,
				timestamp: Date.now()
			};
			return cache[weather].data;
		} catch (error) {
			return error;
		}
	}
};

module.exports = weatherHandler;