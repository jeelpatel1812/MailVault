import { Router } from "express";
import {registerController, loginController, logoutController} from "../controllers/user.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerController)
router.route("/login").post(loginController)
router.route("/logout").post(verifyJWT, logoutController)

export default router
