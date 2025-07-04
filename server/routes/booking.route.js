import express from 'express';
import bookingController from '../controllers/booking.controller.js';
import verifyToken from '../middleware/verifyToken.js';
const router = express.Router();

router.post("/new",verifyToken,bookingController.createBooking);

router.get("/",bookingController.getAllBookings);
router.delete("/cancel/:id", bookingController.cancelBooking);
router.post("/assignDriver/:id", bookingController.assignDriver);
router.get("/ride-details/:id", bookingController.getBookingDetails);
router.put("/status/:id",bookingController.updateStatus)
router.post("/ride-complete/:id",bookingController.rideComplete);
router.post("/ride-request",bookingController.bookingRequests);
router.get("/requested", bookingController.getRequestedBookings);

export default router;