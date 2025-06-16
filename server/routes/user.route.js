import express from 'express';
import verifyToken from '../middleware/verifyToken.js';
import userController from '../controllers/user.controller.js';

const router = express.Router();


router.get("/my-rides",verifyToken,userController.getRides)
export default router;