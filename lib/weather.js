const axios = require('axios');
const dotenv = require('dotenv');
let cache = require('../cache');
dotenv.config();

const WEATHER_API = process.env.WEATHER_API_KEY;

class Forecast {
	constructor(date, imgCode, temp, description) {
		this.date = this.formatDate(date);
		this.img = `https://www.weatherbit.io/static/img/icons/${imgCode}.png`;
		this.temp = temp;
		this.description = description;
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
		response.json(cache[weather].data)
	} else {
		try {
			const weatherResponse = await axios.get(`https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${WEATHER_API}&include=minutely`);
			let weatherData = weatherResponse.data.data.map((element) => new Forecast(element.datetime, element.weather.icon, element.temp, element.weather.description));

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
			response.json(cache[weather].data);
		} catch (error) {
			console.log('weather', error)
			let errorObject = {
				status: error.response ? error.response.status : 500,
				response: error.response ? error.response.statusText : 'Internal Server Error',
				dataMessage: error.response ? error.response.data.status_message : 'Unknown Error',
			}
			response.status(errorObject.status).json(errorObject);
		}
	}
};

module.exports = weatherHandler;