const Note = require('./models/notes');

async function readNotes(req, res){
	try{
		const notes = await Note.find({})
		res.status(200).send(notes)
	} catch(error) {
		console.error(error);
		res.status(500).send('Unable to find Notes')
	}
}

async function postNotes(request, response) {
	try {
		const newNote = await Note.create({...request.body});
		response.send(newNote);
	} catch(error) {
		console.error(error);
		response.status(500).send('Error creating new Note');
	}
}

async function deleteNotes(request, response) {
	const id = request.params.id;

	try {
		await Note.findOneAndDelete({_id:id});
		response.status(204).send('successfully deleted');
	} catch(error) {
		console.error(error)
		response.status(404).send(`Unable to delete note with id ${id}`);
	}
}

async function putNotes(request, response) {
	const id = request.params.id;

	try{
		await Note.findOneAndUpdate({ _id: id}, request.body, {new: true});
		response.status(200).send('successfully updated');
	} catch (error) {
		console.error(error);
		response.status(500).send(`Unable to update note with id ${id}`);
	}
}

module.exports = {readNotes, postNotes, putNotes, deleteNotes};