const express = require('express');
const router = express.Router();

// GET /joke — Separate joke page
router.get('/joke', async (req, res) => {
  try {
    const response = await fetch('https://official-joke-api.appspot.com/random_joke');
    const data = await response.json();
    res.render('joke', { joke: data });
  } catch {
    res.render('joke', {
      joke: {
        setup: 'Why don’t programmers like nature?',
        punchline: 'Too many bugs.'
      }
    });
  }
});

module.exports = router;
