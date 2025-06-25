import { notifyAdmin, notifyUser, notifyDriver } from "../index.js";
import bookingModel from "../models/ride.model.js";
import User from "../models/user.model.js";

const createBooking = async (req, res) => {
  console.log("Booking raid");
  const locations = req.body;
  console.log(locations);

  const decoded = req.user;
  // console.log(decoded.userId);
  const user = await User.findById(decoded.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  console.log("booking user", user);
  const newBooking = await bookingModel.create({
    user: decoded.userId,
    locations,
    status: "requested",
    driver: null,
    userName: user.username,
    userPhone: user.phone,
  });
  console.log(newBooking);
  return res.status(200).json({
    message:
      "Your booking has been received. We will notify you when the ride is confirmed. Thank you!",
    details: { bookingId: newBooking._id },
    newBooking,
  });
};
export const getAllBookings = async (req, res) => {
  const bookings = await bookingModel.find({});

  return res.status(200).json(bookings);
};

export const cancelBooking = async (req, res) => {
  const { id } = req.params;
  const booking = await bookingModel.findById(id);
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  booking.status = "cancelled";
  await booking.save();
  return res.status(200).json({ message: "Booking cancelled successfully" });
};

export const assignDriver = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  if (!id) return res.status(400).json({ error: "Invalid booking ID" });
  const { driverId } = req.body;
  const rideDetails = await bookingModel.findById(id);
  if (!rideDetails)
    return res.status(404).json({ error: "Ride details not found" });

  rideDetails.driver = driverId;
  rideDetails.status = "assigned";
  await rideDetails.save();
  console.log(rideDetails);
  await notifyDriver(rideDetails);
  await notifyUser(rideDetails);
  return res.status(200).json({ message: "Driver assigned successfully" });
};

const getBookingDetails = async (req, res) => {
  const { id } = req.params;
  const booking = await bookingModel.findById(id);
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  const riderDetails = await User.findById(booking.driver).select("-password");
  if (!riderDetails)
    return res.status(404).json({ error: "Rider details not found" });
  return res.status(200).json({ booking, riderDetails });
};
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, locationIndex, timestamp } = req.body;
    console.log(status, id, locationIndex, timestamp);
    if (!id) return res.status(400).json({ error: "Invalid booking ID" });
    const rideDetails = await bookingModel.findById(id);
    if (!rideDetails)
      return res.status(404).json({ error: "Ride details not found" });
    console.log(rideDetails);
    rideDetails.locations[locationIndex].visited = status;
    rideDetails.locations[locationIndex].timestamp = timestamp;

    rideDetails.markModified(`locations.${locationIndex}`);
    await rideDetails.save();
    console.log("updated successfully", rideDetails);
    return res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Status updating failed" });
  }
};
export default {
  createBooking,
  getAllBookings,
  cancelBooking,
  assignDriver,
  updateStatus,
  getBookingDetails,
};
