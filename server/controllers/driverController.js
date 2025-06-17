import Ride from "../models/ride.model.js";

export const getAssignedRides = async( req,res)=>{
    const {userId} = req.user;
    if(!userId) return res.status(401).json({error: "Unauthorized: No User ID provided"});
    const assignedRides = await Ride.find({driver: userId,status:"assigned"}).populate('user');
    return res.status(200).json(assignedRides);
}

const changeRideStatus = async(req,res)=>{
    const {id} = req.params;
    const { status} = req.body;
    console.log(id);
    if(!id ||!status) return res.status(400).json({error: "Bad Request: Missing rideId or status"});
    try{
        const updatedRide = await Ride.findByIdAndUpdate(id, {status}, {new:true}).populate('user');
        return res.status(200).json({message:"Ride status updated",updatedRide});

    }catch(error){
        console.error(error);
        return res.status(500).json({error: "Internal Server Error"});
    }
}
export default {getAssignedRides,changeRideStatus}