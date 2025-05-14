const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

// GET /log
router.get('/log', (req, res) => {
  res.render('log');
});

// POST /log
router.post('/log', async (req, res) => {
  const { topic, date, duration, notes } = req.body;
  await req.app.locals.collection.insertOne({
    topic,
    date,
    duration: parseInt(duration),
    notes
  });
  const host = req.protocol + '://' + req.get('host');
  res.render('submitted', { host });
});

// GET /sessions
router.get('/sessions', async (req, res) => {
  const sessions = await req.app.locals.collection.find().sort({ date: -1 }).toArray();
  res.render('sessions', { sessions });
});

// GET /edit/:id
router.get('/edit/:id', async (req, res) => {
  const session = await req.app.locals.collection.findOne({ _id: new ObjectId(req.params.id) });
  if (session) {
    res.render('edit', { session });
  } else {
    res.send('Session not found.');
  }
});

// POST /edit/:id
router.post('/edit/:id', async (req, res) => {
  const { topic, date, duration, notes } = req.body;
  await req.app.locals.collection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { topic, date, duration: parseInt(duration), notes } }
  );
  res.redirect('/sessions');
});

// POST /delete/:id
router.post('/delete/:id', async (req, res) => {
  await req.app.locals.collection.deleteOne({ _id: new ObjectId(req.params.id) });
  res.redirect('/sessions');
});

// POST /deleteAll
router.post('/deleteAll', async (req, res) => {
  await req.app.locals.collection.deleteMany({});
  res.redirect('/sessions');
});

module.exports = router;
