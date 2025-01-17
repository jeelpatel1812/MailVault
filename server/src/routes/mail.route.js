import { Router } from "express";
import {mailComposer, getInboxMails, toggleStarredMail, trashTheMail, unTrashTheMail, getTrashedMails, getStarredMails, getUnreadMails, readTheMail, scheduleMail, getSentMails} from "../controllers/mail.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.route("/compose").post(verifyJWT, upload.single("file"), mailComposer)
router.route("/scheduleMail").post(verifyJWT, scheduleMail)
router.route("/getInbox").get(verifyJWT, getInboxMails)
router.route("/getStarredMails").get(verifyJWT, getStarredMails)
router.route("/getTrashedMails").get(verifyJWT, getTrashedMails)
router.route("/getUnreadMails").get(verifyJWT, getUnreadMails)
router.route("/getSentMails").get(verifyJWT, getSentMails)
router.route("/setStarredMail/:mailId").patch(verifyJWT, toggleStarredMail)
router.route("/trashTheMail/:mailId").patch(verifyJWT, trashTheMail)
router.route("/readTheMail/:mailId").patch(verifyJWT, readTheMail)
router.route("/unTrashTheMail/:mailId").patch(verifyJWT, unTrashTheMail)

export default router
