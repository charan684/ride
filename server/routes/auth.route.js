import express from "express"
import {getMe, signUpUser,login,logout, driverSignup } from "../controllers/auth.controller.js"
import {protectRoute} from "../middleware/protectRoute.js"
const router=express.Router()

router.post("/signup",signUpUser)
router.post("/login",login)
router.post("/logout",logout)
router.get("/me",protectRoute,getMe)
router.post("/driver/signup",driverSignup)
export default router;