import express from "express"
import {getMe, signUpUser,login,logout } from "../controllers/auth.controller.js"
import {protectRoute} from "../middleware/protectRoute.js"
const router=express.Router()

router.post("/signup",signUpUser)
router.post("/login",login)
router.post("/logout",logout)
router.get("/me",protectRoute,getMe)
export default router;