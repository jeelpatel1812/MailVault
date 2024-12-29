import { Router } from "express";
import {mailComposer} from "../controllers/mail.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/compose").post(verifyJWT, mailComposer)

export default router
