import { Router } from "express";
import { body, param } from "express-validator";
import {
  createCommunity,
  fetchAllCommunities,
  fetchCommunityMembers,
  fetchJoinedCommunity,
  fetchOwnedCommunity,
} from "../controllers/community.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, fetchAllCommunities);

router.post(
  "/",
  authMiddleware,
  [body("name").exists().isLength({ min: 2 })],
  createCommunity
);

router.get(
  "/:id/members",
  [param("id").exists().notEmpty().withMessage("community id is invalid")],
  fetchCommunityMembers
);

router.get("/me/owner", authMiddleware, fetchOwnedCommunity);

router.get("/me/member", authMiddleware, fetchJoinedCommunity);

export default router;
