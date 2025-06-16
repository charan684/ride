import express from "express";
import User from "../models/user.model.js";
const router = express.Router();

router.post('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { lat, lng } = req.body;

        const user = await User.findOneAndUpdate(
            { id },
            { $set: { location: { lat, lng } } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});
export default router;