import express from 'express';
import driverController from "../controllers/driverController.js";
const router = express.Router();
router.get("/assigned-rides",driverController.getAssignedRides);

export default router;