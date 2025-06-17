import express from 'express';
import driverController from "../controllers/driverController.js";
import verifyToken from '../middleware/verifyToken.js';
const router = express.Router();
router.get("/assigned-rides",verifyToken,driverController.getAssignedRides);
router.put("/change-ride-status/:id", verifyToken, driverController.changeRideStatus);
export default router;