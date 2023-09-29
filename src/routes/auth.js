import { Router } from "express";
import { body } from "express-validator";
import { userSignIn, userSignUp, getUser } from "../controllers/auth.js";
import { strongPassword } from "../utils/validation.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post(
  "/signup",
  [
    body("name")
      .exists()
      .isLength({ min: 2 })
      .withMessage("Name should more than 2 characters"),
    body("email").exists().isEmail().withMessage("Email is a required field"),
    body("password")
      .exists()
      .isLength({ min: 6 })
      .withMessage("Password should be at least 6 characters"),
  ],
  strongPassword,
  userSignUp
);

router.post("/signin", userSignIn);

router.get("/me", authMiddleware, getUser);

export default router;
