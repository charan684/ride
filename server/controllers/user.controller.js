import Ride from "../models/ride.model.js";


const getRides =async (req,res)=>{
    const {userId} = req.user;
    if(!userId) return res.status(401).json({error: "Unauthorized"});
    
    const myRides = await Ride.find({user: userId}).sort({createdAt: -1});
    return res.json(myRides);
}

export default {getRides}