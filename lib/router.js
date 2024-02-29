const express = require('express');
const weatherHandler = require('./weather');
const npsHandler = require('./nationalParks');
const router = express.Router();

router.get('/city-info', async (req, res) => {
	const { city } = req.query;
	let npsData = {}; // Initialize npsData

	try {
		// Fetch location data
		const locationData = await weatherHandler({ query: { city } }, res);

		// Check if locationData is defined and does not contain an error
		if (!locationData || locationData.error) {
			return res.status(400).json({ error: locationData ? locationData.error : 'Failed to fetch location data' });
		}

		// Check if locationData[0].stateCode is defined
		if (locationData[0] && locationData[0].stateCode) {
			npsData = await npsHandler({ query: { stateCode: locationData[0].stateCode } }, res);
		}

		// Combine all data
		const cityData = {
			weather: locationData,
			campsites: npsData,
		};

		// Send response
		res.json(cityData);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Failed to fetch city info' });
	}
});

module.exports = router;