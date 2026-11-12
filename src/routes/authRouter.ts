import { Router } from "express";
import authContoller from "../controllers/authController.ts";

const authRouter = Router();

authRouter.get("/signup", authContoller.getSignup);

authRouter.post(
  "/signup",
  authContoller.signupValidation,
  authContoller.postSignup,
);

export default authRouter;
