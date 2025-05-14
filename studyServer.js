const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { MongoClient, ServerApiVersion } = require("mongodb");
const sessionRoutes = require('./routes/sessionRoutes');

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

// Root route - show a random joke
app.get('/', async (req, res) => {
  try {
    const response = await fetch('https://official-joke-api.appspot.com/random_joke');
    const data = await response.json();
    res.render('index', { joke: data });
  } catch {
    res.render('index', {
      joke: {
        setup: 'Why don’t programmers like nature?',
        punchline: 'Too many bugs.'
      }
    });
  }
});

// Main app start
async function main() {
  try {
    await client.connect();
    const db = client.db(databaseName);
    const collection = db.collection(collectionName);

    // Make the MongoDB collection accessible in routes
    app.locals.collection = collection;

    // Use express.Router() for all session routes
    app.use('/', sessionRoutes);

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (e) {
    console.error(e);
  }
}

main();
