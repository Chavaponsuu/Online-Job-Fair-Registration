const Booking = require("../models/Booking");

const DATE_MIN = new Date('2022-05-10T00:00:00Z');
const DATE_MAX = new Date('2022-05-13T23:59:59Z');

exports.createBooking = async (req,res) =>{
    try{
    const {companies , date} = req.body;
    const userId = req.user._id;
    const bookingDate = new Date(date);
    if(bookingDate < DATE_MIN || bookingDate > DATE_MAX){
        return res.status(400).json({success:false , msg: "Date out of allowed range"});

      }
    const existingBookings = await Booking.find({user:userId});
    if(existingBookings.length >= 3){
        return res.status(400).json({success:false,msg:"Max 3 booking allowed"});
    }

    if(!companies || !Array.isArray(companies) || companies.length === 0){
        return res.status(400).json({success :false,msg : "Select at least one company"});

    }
      const companySet = new Set(companies);
    if (companySet.size !== companies.length) {
      return res.status(400).json({ success: false, msg: "You have selected duplicate companies" });
    }
    

    const booking = await Booking.create({user:userId , date:bookingDate,companies:companies});
    res.status(201).json({success:true,booking});
    }catch(err){
        res.status(500).json({success:false,error:err.message});
    }


}

exports.getBookings = async(req,res) =>{
    try{
        const isAll = req.user.role === "admin";
        const filter = isAll ?  {}:{user:req.user._id};

        const bookings = await Booking.find(filter).populate("companies").populate("user","name email tel");

        res.status(200).json({success:true , bookings});
    }catch(err){
        res.status(500).json({msg:"Server error"});
    }

}