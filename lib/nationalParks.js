require('dotenv').config();
const axios = require('axios');

class Campsite {
	constructor(title, parkCode, description, reservationInfo, reservationUrl, images, weather) {
		this.tite = title;
		this.parkCode = parkCode;
		this.description = description;
		this.reservationInfo = reservationInfo;
		this.reservationUrl = reservationUrl;
		this.images = images;
		this.weather = weather
	}

	formatDate(inputDate) {
		const parsedDate = new Date(inputDate);
		return `${parsedDate.toLocaleDateString('en-US', {month: 'numeric', day: 'numeric' })}`;
	}
}
const npsHandler = async (request, response) => {
	const { stateCode } = request.query;
	const apiKey = process.env.NPS_API_KEY;
	const start = 10;

	try {
		const npsResponse = await axios.get('https://developer.nps.gov/api/v1/campgrounds', {
			params: {
				stateCode: stateCode,
				start: start,
				api_key: apiKey
			},
			headers: {
				'Accept': 'application/json'
			}
		});

		const campsites = npsResponse.data.data.map(campsite => new Campsite(campsite.name, campsite.parkCode, campsite.description, campsite.reservationInfo, campsite.reservationUrl, campsite.images, campsite.weatherOverview) )

		return campsites;
	} catch (error) {
		console.error(error);
		return { error: 'Failed to fetch data from National Park Service API' };
	}
};

module.exports = npsHandler;