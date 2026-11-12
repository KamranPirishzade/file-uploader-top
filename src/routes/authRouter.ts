import { Router } from "express";
import authContoller from "../controllers/authController.ts";

const authRouter = Router();

authRouter.get("/signup", authContoller.getSignup);

authRouter.post(
  "/signup",
  authContoller.signupValidation,
  authContoller.postSignup,
);

authRouter.get("/login", authContoller.getLoginPage);
authRouter.post("/login", authContoller.postLogin);

authRouter.post("/logout", authContoller.postLogout);

export default authRouter;
