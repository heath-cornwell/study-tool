const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { MongoClient, ServerApiVersion } = require("mongodb");

const jokeRoutes = require('./routes/jokeRoutes');

const app = express();
const port = process.env.PORT || 3000;

// MongoDB setup
const uri = process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:27017';
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

const databaseName = "studycompaniondb";
const collectionName = "sessions";

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', './templates');

// Routes directly in this file
app.get('/', async (req, res) => {
  try {
    const response = await fetch('https://official-joke-api.appspot.com/random_joke');
    const data = await response.json();
    res.render('index', { joke: data });
  } catch {
    res.render('index', {
      joke: {
        setup: 'Why do programmers prefer dark mode?',
        punchline: 'Because light attracts bugs.'
      }
    });
  }
});

// Start server after DB connection
async function main() {
  try {
    await client.connect();
    const db = client.db(databaseName);
    const collection = db.collection(collectionName);

    // Logging form
    app.get('/log', (req, res) => {
      res.render('log');
    });

    app.post('/log', async (req, res) => {
      const { topic, date, duration, notes } = req.body;
      await collection.insertOne({ topic, date, duration: parseInt(duration), notes });
      const host = req.protocol + '://' + req.get('host');
      res.render('submitted', { host });
    });

    // View sessions
    app.get('/sessions', async (req, res) => {
      const sessions = await collection.find().sort({ date: -1 }).toArray();
      res.render('sessions', { sessions });
    });

    // Edit a session
    app.get('/edit/:id', async (req, res) => {
      const { ObjectId } = require('mongodb');
      const session = await collection.findOne({ _id: new ObjectId(req.params.id) });
      if (session) {
        res.render('edit', { session });
      } else {
        res.send('Session not found.');
      }
    });

    app.post('/edit/:id', async (req, res) => {
      const { ObjectId } = require('mongodb');
      const { topic, date, duration, notes } = req.body;
      await collection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { topic, date, duration: parseInt(duration), notes } }
      );
      res.redirect('/sessions');
    });

    // Delete one session
    app.post('/delete/:id', async (req, res) => {
      const { ObjectId } = require('mongodb');
      await collection.deleteOne({ _id: new ObjectId(req.params.id) });
      res.redirect('/sessions');
    });

    // Delete all sessions
    app.post('/deleteAll', async (req, res) => {
      await collection.deleteMany({});
      res.redirect('/sessions');
    });

    // Use joke route (to satisfy express.Router())
    app.use('/', jokeRoutes);

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (e) {
    console.error(e);
  }
}

main();
