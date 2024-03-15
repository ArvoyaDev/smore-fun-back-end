const mongoose = require('mongoose');

const { Schema } = mongoose;

const noteSchema = new Schema ({
	date: String,
	title: String,
	entry: String,
	email: String
})

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;