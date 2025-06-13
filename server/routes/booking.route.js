import express from 'express';
import bookingController from '../controllers/booking.controller.js';
import verifyToken from '../middleware/verifyToken.js';
const router = express.Router();

router.post("/new",verifyToken,bookingController.createBooking);



export default router;