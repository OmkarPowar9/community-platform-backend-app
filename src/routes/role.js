import { Router } from "express";
import { body } from "express-validator";
import { createRole, fetchAllRoles } from "../controllers/role.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  [
    body("name")
      .exists()
      .isLength({ min: 2 })
      .withMessage("role name should be at least 2 characters"),
  ],
  createRole
);

router.get("/", authMiddleware, fetchAllRoles);

export default router;
