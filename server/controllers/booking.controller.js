import { notifyAdmin } from "../index.js";
import bookingModel from "../models/ride.model.js"
const createBooking = async(req,res)=>{
    console.log("Booking raid");
    const {source,destination} = req.body;
    const decoded = req.user;
    console.log(decoded);
    notifyAdmin({source,destination});
    const newBooking =  bookingModel.create({
       user:decoded.id,
       pickupLocation:source,
       destination,
       status:"requested",
        bookedAt: new Date()
    });
    return res.status(200).json({message:"Your booking has been received. We will notify you when the ride is confirmed. Thank you!",details:{bookingId:newBooking._id}});
}


export default {createBooking}