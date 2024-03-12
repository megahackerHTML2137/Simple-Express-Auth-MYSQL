import express, { Router } from "express";
import {
  register,
  login,
  logout,
  checkSession,
} from "../controllers/authController";

const router: Router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/session", checkSession);

export default router;
