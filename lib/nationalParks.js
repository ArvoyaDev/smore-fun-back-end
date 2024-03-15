require('dotenv').config();
const axios = require('axios');
const url = require("url");

class Campsite {
	constructor(title, parkCode, description, reservationInfo, reservationUrl, images, weather, lat, lon) {
		this.title = title;
		this.parkCode = parkCode;
		this.description = description;
		this.reservationInfo = reservationInfo;
		this.reservationUrl = reservationUrl;
		this.images = images;
		this.weather = weather
		this.lat = lat
		this.lon = lon
	}

	formatDate(inputDate) {
		const parsedDate = new Date(inputDate);
		return `${parsedDate.toLocaleDateString('en-US', {month: 'numeric', day: 'numeric' })}`;
	}
}

function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
const npsHandler = async (request, response) => {
	const { stateCode, lat, lon } = request.query;
	const apiKey = process.env.NPS_API_KEY;
	const locationKey = process.env.LOCATIONIQ_API_KEY;


	const convertMetersToMiles = (meters) => {
		return (meters * 0.000621371).toFixed(2);
	};

	const convertSecondsToHoursMinutes = (seconds) => {
		let hours = Math.floor(seconds / 3600);
		let minutes = Math.floor((seconds % 3600) / 60);
		return `${hours} hrs ${minutes} min`;
	};

	try {
		const npsResponse = await axios.get('https://developer.nps.gov/api/v1/campgrounds', {
			params: {
				stateCode: stateCode,
				api_key: apiKey
			},
			headers: {
				'Accept': 'application/json'
			}
		});

		let campsites = npsResponse.data.data.map(campsite => new Campsite(campsite.name, campsite.parkCode, campsite.description, campsite.reservationInfo, campsite.reservationUrl, campsite.images, campsite.weatherOverview, campsite.latitude, campsite.longitude));

		campsites = campsites.filter(campsite => campsite.images.length !== 0 && campsite.description !== '');

		for (let campsite of campsites) {
			await delay(500); // Introduce a delay of 1 second (1000 milliseconds)
			const campsiteLocation = await axios.get(`https://us1.locationiq.com/v1/directions/driving/${lon},${lat};${campsite.lon},${campsite.lat}?key=${locationKey}&steps=true&alternatives=true&geometries=polyline&overview=full&`);
			campsite.duration = convertSecondsToHoursMinutes(campsiteLocation.data.routes[0].duration);
			campsite.distance = convertMetersToMiles(campsiteLocation.data.routes[0].distance);
		}



		const alerts = await fetchAlerts(stateCode);

		return { campsites, alerts };
	} catch (error) {
		console.error(error);
		return { error: 'Failed to fetch data from National Park Service API' };
	}
};

async function fetchAlerts(stateCode) {
	const apiKey = process.env.NPS_API_KEY;

	try {
		const alertsResponse = await axios.get('https://developer.nps.gov/api/v1/alerts', {
			params: {
				stateCode: stateCode,
				api_key: apiKey
			},
			headers: {
				'Accept': 'application/json'
			}
		});

		const alerts = alertsResponse.data.data.map(alert => ({
			description: alert.description,
			title: alert.title,
			url: alert.url,
			category: alert.category,
			lastIndexedDate: alert.lastIndexedDate
		}));

		return alerts;
	} catch (error) {
		console.error(error);
		return { error: 'Failed to fetch alerts from National Park Service API' };
	}
}

module.exports = npsHandler;