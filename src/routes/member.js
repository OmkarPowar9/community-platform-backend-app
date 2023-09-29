import { Router } from "express";
import { body } from "express-validator";
import { addMember, removeMember } from "../controllers/member.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware, addMember);

router.delete("/:id", authMiddleware, removeMember);

export default router;
