const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { MongoClient, ServerApiVersion } = require("mongodb");
const jokeRoutes = require('./routes/jokeRoutes');
const app = express();
const port = process.env.PORT || 3000;
const uri = process.env.MONGO_CONNECTION_STRING;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
const databaseName = "CMSC335DB";
const collectionName = "sessions";
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', './templates');

app.get('/', (req, res) => {
  const host = req.protocol + '://' + req.get('host');
  res.render('index', { host });
});

async function main() {
  try {
    await client.connect();
    const db = client.db(databaseName);
    const collection = db.collection(collectionName);

    app.get('/log', (req, res) => {
      res.render('log');
    });

    app.post('/log', async (req, res) => {
      const { topic, date, duration, notes } = req.body;
      await collection.insertOne({ topic, date, duration: parseInt(duration), notes });
      const host = req.protocol + '://' + req.get('host');
      res.render('submitted', { host });
    });

    app.get('/sessions', async (req, res) => {
      const sessions = await collection.find().sort({ date: -1 }).toArray();
      res.render('sessions', { sessions });
    });

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

    app.post('/delete/:id', async (req, res) => {
      const { ObjectId } = require('mongodb');
      await collection.deleteOne({ _id: new ObjectId(req.params.id) });
      res.redirect('/sessions');
    });

    app.post('/deleteAll', async (req, res) => {
      await collection.deleteMany({});
      res.redirect('/sessions');
    });

    app.use('/', jokeRoutes);
    app.listen(port);
  } catch (e) {
    console.error(e);
  }
}

main();