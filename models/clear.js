require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_CONN);

const Book = require('./notes');

async function clear() {
	try {
		await Note.deleteMany({});
		console.log('Notes cleared');
	} catch (err) {
		console.error(err);
	} finally {
		mongoose.disconnect();
	}

}

clear();

