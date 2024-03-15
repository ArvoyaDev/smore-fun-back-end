require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const verifyUser = require('./models/authorize');
const {readNotes, postNotes, putNotes, deleteNotes} = require('./handlers');
const cityInfoRouter = require('./lib/router');

const app = express();

app.use(cors());

app.use(express.json());


const PORT = process.env.PORT;

mongoose.connect(process.env.MONGODB_CONN);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => console.log('Mongoose is connected'));

app.get('/', (req, res) => res.status(200).send('Default Route Working'));
app.use(verifyUser);
// * Routes to all other APIs
app.use('/api', cityInfoRouter);
// * Notebook CRUD
app.get('/notes', readNotes);
app.post('/notes', postNotes);
app.delete('/notes/:id', deleteNotes);
app.put('/notes/:id', putNotes);


app.get('*', (req, res) => res.status(400).send('Resource Not Found'));

app.listen(PORT, () =>console.log(`listening on ${PORT}`));
