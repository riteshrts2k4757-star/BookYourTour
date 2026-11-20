const express = require('express');
const { searchTrains, searchFlights } = require('../controllers/transportController');

const router = express.Router();

router.get('/trains/search', searchTrains);
router.get('/trains', searchTrains);
router.get('/flights/search', searchFlights);
router.get('/flights', searchFlights);

module.exports = router;
