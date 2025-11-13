const express = require('express');
const { createBooking, getBookings,getBookingById,deleteBooking,updateBooking } = require('../controllers/booking');
const { protect, authorize } = require('../middlewares/auth'); // JWT auth
const router = express.Router();

router.post('/', protect ,createBooking);
router.get('/' , protect,getBookings);
router.route('/:id')
  .get(protect, getBookingById)
  .put(protect, updateBooking)      // Remove authorize - controller handles it
  .delete(protect, deleteBooking);  // Remove authorize - controller handles it
module.exports = router;
