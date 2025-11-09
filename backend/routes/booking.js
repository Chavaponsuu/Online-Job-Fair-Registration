const express = require('express');
const { createBooking, getBookings } = require('../controllers/booking');
const { protect, authorize } = require('../middlewares/auth'); // JWT auth
const router = express.Router();

router.post('/', protect ,createBooking);
router.get("/" , protect,getBookings)

module.exports = router;
