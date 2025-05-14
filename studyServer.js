const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion } = require("mongodb");
const { ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', './templates');

const databaseName = "CMSC335DB";
const collectionName = "sessions";
const uri = process.env.MONGO_CONNECTION_STRING;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

app.get('/', async (req, res) => {
  try {
    const response = await fetch('https://official-joke-api.appspot.com/random_joke');
    const data = await response.json();
    res.render('index', { joke: data });
  } catch {
    res.render('index', { joke: { setup: 'Why did the server go broke?', punchline: 'Because it couldn’t cache in!' } });
  }
});

app.get('/log', (req, res) => {
  res.render('log');
});

app.post('/log', async (req, res) => {
  const session = {
    topic: req.body.topic,
    date: req.body.date,
    duration: parseInt(req.body.duration),
    notes: req.body.notes
  };
  await collection.insertOne(session);
  const host = req.protocol + '://' + req.get('host');
  res.render('submitted', { host });
});

app.get('/sessions', async (req, res) => {
  const sessions = await collection.find().sort({ date: -1 }).toArray();
  res.render('sessions', { sessions });
});

app.get('/edit/:id', async (req, res) => {
  const session = await collection.findOne({ _id: new ObjectId(req.params.id) });
  if (session) {
    res.render('edit', { session });
  } else {
    res.send('Session not found.');
  }
});

app.post('/edit/:id', async (req, res) => {
  const { topic, date, duration, notes } = req.body;
  await collection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { topic, date, duration: parseInt(duration), notes } }
  );
  res.redirect('/sessions');
});

app.post('/delete/:id', async (req, res) => {
  await collection.deleteOne({ _id: new ObjectId(req.params.id) });
  res.redirect('/sessions');
});

app.post('/deleteAll', async (req, res) => {
  await collection.deleteMany({});
  res.redirect('/sessions');
});

async function main() {
  try {
    await client.connect();
    const db = client.db(databaseName);
    collection = db.collection(collectionName);
    app.listen(port);
  } catch (e) {
    console.error(e);
  }
}

main();
