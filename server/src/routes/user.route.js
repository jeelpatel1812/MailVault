import { Router } from "express";
import {registerController, loginController} from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerController)
router.route("/login").post(loginController)

export default router
