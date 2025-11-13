const Booking = require("../models/Booking");

const DATE_MIN = new Date('2022-05-10T00:00:00Z');
const DATE_MAX = new Date('2022-05-13T23:59:59Z');


//@desc Create a booking
//@route POST /api/v1/booking
//@access Private
exports.createBooking = async (req, res) => {
  try {
    const { company, date } = req.body;
    const userId = req.user._id;

    // 1) Validate
    if (!company || !date) {
      return res
        .status(400)
        .json({ success: false, msg: "Company and date are required" });
    }

    // 2) Validate date range
    const bookingDate = new Date(date);
    if (bookingDate < DATE_MIN || bookingDate > DATE_MAX) {
      return res
        .status(400)
        .json({ success: false, msg: "Date out of allowed range" });
    }

    // 3) Get user's existing bookings
    const existingBookings = await Booking.find({ user: userId });

    if (existingBookings.length >= 3) {
      return res
        .status(400)
        .json({ success: false, msg: "Max 3 booking sessions allowed" });
    }

    // 4) Prevent booking same company
    const sameCompany = existingBookings.find(
      (b) => b.company.toString() === company.toString()
    );

    if (sameCompany) {
      return res
        .status(400)
        .json({ success: false, msg: "You already booked this company" });
    }

    // 5) Prevent booking on the same day
    const sameDay = existingBookings.find(
      (b) =>
        b.date.toISOString().slice(0, 10) ===
        bookingDate.toISOString().slice(0, 10)
    );

    if (sameDay) {
      return res.status(400).json({
        success: false,
        msg: "You already booked a session on this day",
      });
    }

    // 6) Create booking
    const booking = await Booking.create({
      user: userId,
      company,
      date: bookingDate,
    });

    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

//@desc Get bookings
//@route GET /api/v1/booking
//@access Private
exports.getBookings = async(req,res) =>{
    try{
        const isAll = req.user.role === "admin";
        const filter = isAll ?  {}:{user:req.user._id};

        const bookings = await Booking.find(filter).populate("company").populate("user","name email tel");

        res.status(200).json({success:true , bookings});
    }catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


//@desc Get a single booking
//@route GET /api/v1/booking/:id
//@access Private
exports.getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;

    // 1) Find booking
    const booking = await Booking.findById(bookingId)
      .populate("company")
      .populate("user", "name email tel");

    if (!booking) {
      return res.status(404).json({
        success: false,
        msg: "Booking not found",
      });
    }

    // 2) Permission check
    const isOwner = booking.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        msg: "Not authorized to view this booking",
      });
    }

    // 3) Success
    res.status(200).json({
      success: true,
      booking,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};


//@desc Delete a booking
//@route DELETE /api/v1/booking/:id
//@access Private
exports.deleteBooking = async(req,res) =>{
    try{
        const bookingId = req.params.id;
        const booking = await Booking.findById(bookingId);
        if(!booking){
            return res.status(404).json({success:false,msg:"Booking not found"});
        }
        if(booking.user.toString() !== req.user._id.toString() && req.user.role !== "admin"){
            return res.status(403).json({success:false,msg:"Not authorized to delete this booking"});
        }
        await booking.deleteOne();
        res.status(200).json({success:true,msg:"Booking deleted"});
    }catch(err){
        res.status(500).json({success:false,error:err.message});
    }
}

//@desc Update a booking
//@route PUT /api/v1/booking/:id
//@access Private
exports.updateBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { company, date } = req.body;
    const userId = req.user._id;

    // Input validation
    if (!company && !date) {
      return res.status(400).json({
        success: false,
        msg: "Nothing to update. Provide company or date.",
      });
    }

    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, msg: "Booking not found" });
    }

    // Permission check
    if (
      booking.user.toString() !== userId.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, msg: "Not authorized to update this booking" });
    }

    // Get all user bookings except this one
    const userBookings = await Booking.find({
      user: userId,
      _id: { $ne: bookingId },
    });

    // --- VALIDATE COMPANY ---
    if (company) {
      const duplicateCompany = userBookings.find(
        (b) => b.company.toString() === company.toString()
      );

      if (duplicateCompany) {
        return res.status(400).json({
          success: false,
          msg: "You already booked this company in another session",
        });
      }

      booking.company = company;
    }

    // --- VALIDATE DATE ---
    if (date) {
      const newDate = new Date(date);

      if (newDate < DATE_MIN || newDate > DATE_MAX) {
        return res.status(400).json({
          success: false,
          msg: "Date out of allowed range",
        });
      }

      // prevent same-day duplicates
      const duplicateDay = userBookings.find(
        (b) =>
          b.date.toISOString().slice(0, 10) ===
          newDate.toISOString().slice(0, 10)
      );

      if (duplicateDay) {
        return res.status(400).json({
          success: false,
          msg: "You already have a session on this day",
        });
      }
      booking.date = newDate;
    }

    // Save updated booking
    await booking.save();

    res.status(200).json({
      success: true,
      msg: "Booking updated",
      booking,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
