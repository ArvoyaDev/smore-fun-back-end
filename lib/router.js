const express = require('express');
const weatherHandler = require('./weather');
const router = express.Router();

router.get('/city-info', async (req, res) => {
	const { city } = req.query;

	try {
		// Fetch location data
		const locationData = await weatherHandler({ query: { city } }, res);

		// Fetch nps data
		const npsData = await npsHandler({ query: { city } }, res);

		// Fetch chatgpt data
		// const chatgptData = await chatgptHandler({ query: { city, weather: locationData.weather } }, res);

		Combine all data
		const cityData = {
			location: locationData,
			nps: npsData,
			chatgpt: chatgptData
		};

		// Send response
		res.json();
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Failed to fetch city info' });
	}
});

module.exports = router;