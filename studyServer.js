const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { MongoClient, ServerApiVersion } = require("mongodb");

const sessionRoutes = require('./routes/sessionRoutes');
const homeRoutes = require('./routes/homeRoutes');

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

// Start the app
async function main() {
  try {
    await client.connect();
    const db = client.db(databaseName);
    const collection = db.collection(collectionName);

    app.locals.collection = collection;

    // Use routers
    app.use('/', homeRoutes);
    app.use('/', sessionRoutes);

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (e) {
    console.error(e);
  }
}

main();
