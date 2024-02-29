require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Note = require('./models/notes');
const {readNotes, postNotes, putNotes, deleteNotes} = require('./handlers');
const cityInfoRouter = require('./lib/router');

const app = express();

app.use(cors());

app.use(express.json());
app.use('/api', cityInfoRouter);

const PORT = process.env.PORT;

mongoose.connect(process.env.MONGODB_CONN);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => console.log('Mongoose is connected'));

// * Notebook CRUD
app.get('/', (req, res) => res.status(200).send('Default Route Working'));
app.get('/notes', readNotes);
app.post('/notes', postNotes);
app.delete('/notes/:id', deleteNotes);
app.put('/notes/:id', putNotes);


app.get('*', (req, res) => res.status(400).send('Resource Not Found'));

app.listen(PORT, () =>console.log(`listening on ${PORT}`));
