import express from "express";
import authController from "../controllers/authController.js";
import authJwt from "../middlewares/authJwt.js";

const authRouter = express.Router();
const { verifyToken } = authJwt;

authRouter.post("/signup", authController.signup);
authRouter.post("/login", authController.login);
authRouter.post("/logout", verifyToken, authController.logout);

export default authRouter;
