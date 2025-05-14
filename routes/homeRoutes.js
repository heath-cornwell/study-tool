const express = require('express');
const router = express.Router();

// GET /
router.get('/', async (req, res) => {
  try {
    const response = await fetch('https://official-joke-api.appspot.com/random_joke');
    const data = await response.json();
    res.render('index', { joke: data });
  } catch {
    res.render('index', {
      joke: {
        setup: 'Why did the developer go broke?',
        punchline: 'Because he used up all his cache.'
      }
    });
  }
});

module.exports = router;
