import express from 'express';
import bookingController from '../controllers/booking.controller.js';
import verifyToken from '../middleware/verifyToken.js';
const router = express.Router();

router.post("/new",verifyToken,bookingController.createBooking);

router.get("/",bookingController.getAllBookings);
router.delete("/cancel/:id", bookingController.cancelBooking);
router.post("/assignDriver/:id", bookingController.assignDriver);
router.post("/status/:id",bookingController.updateStatus)
export default router;