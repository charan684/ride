import express from 'express';
import driverController from "../controllers/driverController.js";
import verifyToken from '../middleware/verifyToken.js';
const router = express.Router();
router.get("/assigned-rides",verifyToken,driverController.getAssignedRides);

export default router;