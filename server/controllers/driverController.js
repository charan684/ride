import Ride from "../models/ride.model.js";

export const getAssignedRides = async( req,res)=>{
    const {userId} = req.user;
    if(!userId) return res.status(401).json({error: "Unauthorized: No User ID provided"});
    const assignedRides = await Ride.find({driver: userId}).populate('user');
    return res.status(200).json(assignedRides);
}

export default {getAssignedRides}