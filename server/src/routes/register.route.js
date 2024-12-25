import { Router } from "express";
import registerController from "../controllers/register.controller";

const router = Router();

router.route("/").get(registerController)

export default router
