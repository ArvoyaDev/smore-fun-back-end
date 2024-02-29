require('dotenv').config();
const mongoose = require('mongoose');
const Note = require('./notes'); // adjust the path to your Note model

mongoose.connect(process.env.MONGODB_CONN);

async function seed() {
	const myNote = new Note ({
		date: '02-28-2024',
		title: 'First Note',
		entry: 'This is the first note.'
	})

myNote.save();

await Note.create({
	date: '02-29-2024',
	title: 'Second Note',
	entry: 'This is the second note.'
})

console.log('Mongoose db has been seeded');
mongoose.disconnect();

}

seed();