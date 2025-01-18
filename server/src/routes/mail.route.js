import { Router } from "express";
import {mailComposer, fetchMailsByCategory, toggleStarredMail, trashTheMail, unTrashTheMail, readTheMail, scheduleMail, getSentMails, getMailCountsByCategory} from "../controllers/mail.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.route("/compose").post(verifyJWT, upload.single("file"), mailComposer)
router.route("/scheduleMail").post(verifyJWT, scheduleMail)

router.route("/fetchMailsByCategory").get(verifyJWT, fetchMailsByCategory)
router.route("/getSentMails").get(verifyJWT, getSentMails)

router.route("/setStarredMail/:mailId").patch(verifyJWT, toggleStarredMail)
router.route("/trashTheMail/:mailId").patch(verifyJWT, trashTheMail)
router.route("/readTheMail/:mailId").patch(verifyJWT, readTheMail)
router.route("/unTrashTheMail/:mailId").patch(verifyJWT, unTrashTheMail)

router.route("/getMailCountsByCategory").get(verifyJWT, getMailCountsByCategory)

export default router
