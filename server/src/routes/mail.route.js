import { Router } from "express";
import {mailComposer, getAllMails} from "../controllers/mail.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/compose").post(verifyJWT, mailComposer)
router.route("/getAllMails").get(verifyJWT, getAllMails)

export default router
