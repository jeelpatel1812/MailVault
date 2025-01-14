import { Router } from "express";
import {mailComposer, getAllMails, toggleStarredMail, trashTheMail, unTrashTheMail, getTrashedMails, getStarredMails, getUnreadMails, readTheMail, scheduledMail, getSentMails} from "../controllers/mail.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.route("/compose").post(verifyJWT, upload.single("file"), mailComposer)
router.route("/scheduleMail").post(verifyJWT, scheduledMail)
router.route("/getAllMails").get(verifyJWT, getAllMails)
router.route("/getStarredMails").get(verifyJWT, getStarredMails)
router.route("/getTrashedMails").get(verifyJWT, getTrashedMails)
router.route("/getUnreadMails").get(verifyJWT, getUnreadMails)
router.route("/getAllMails").get(verifyJWT, getAllMails)
router.route("/getSentMails").get(verifyJWT, getSentMails)
router.route("/setStarredMail").patch(verifyJWT, toggleStarredMail)
router.route("/trashTheMail").patch(verifyJWT, trashTheMail)
router.route("/readTheMail").patch(verifyJWT, readTheMail)
router.route("/unTrashTheMail").patch(verifyJWT, unTrashTheMail)

export default router
