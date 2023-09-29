import { validationResult } from "express-validator";
import MemberModel from "../models/Member.js";
import UserModel from "../models/User.js";
import CommunityModel from "../models/Community.js";
import RoleModel from "../models/Role.js";
import { failed_response, success_response } from "../utils/response.js";
import { Snowflake } from "@theinternetfolks/snowflake";
import { MODIFY_ROLES } from "../utils/constants.js";

export async function addMember(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { community: communityId, user: userId, role: roleId } = req.body;

    const existingMember = await MemberModel.findOne({
      where: { user: userId, community: communityId, role: roleId },
    });

    if (existingMember !== null) {
      const failedResponse = failed_response("Member already exists");
      return res.status(400).json(failedResponse);
    }

    const memberId = Snowflake.generate();

    const userData = await UserModel.findByPk(userId);
    if (userData === null || userData === undefined) {
      const failedResponse = failed_response("User not found");
      return res.status(404).json(failedResponse);
    }

    const community = await CommunityModel.findByPk(communityId);
    if (community === null || community === undefined) {
      const failedResponse = failed_response("Community not found");
      return res.status(404).json(failedResponse);
    }

    const role = await RoleModel.findByPk(roleId);
    if (role === null || role === undefined) {
      const failedResponse = failed_response("Role not found");
      return res.status(404).json(failedResponse);
    }

    const member = await MemberModel.create({
      id: memberId,
      user: userId,
      community: communityId,
      role: roleId,
    });

    const { createdAt, updatedAt, ...rest } = member.dataValues;
    const content = {
      data: {
        ...rest,
        created_at: createdAt,
      },
    };

    const response = success_response(
      "Community created successfully",
      content
    );
    return res.status(201).json(response);
  } catch (err) {
    console.error(err);
    const failedResponse = failed_response("Internal Server Error");
    return res.status(500).json(failedResponse);
  }
}

export async function removeMember(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.user.id;
  const memberToDelete = req.params.id;
  try {
    const member = await MemberModel.findOne({
      where: { user: userId },
      include: {
        foreignKey: "id",
        source: "role",
        as: "roleId",
        model: RoleModel,
        attributes: ["id", "name"],
      },
    });

    let failedResponse = {};
    if (member === null) {
      failedResponse = failed_response("Member not found");
      return res.status(404).json(failedResponse);
    }

    const userToDelete = await MemberModel.findByPk(memberToDelete);

    if (userToDelete === null) {
      failedResponse = failed_response("User not found to delete");
      return res.status(404).json(failedResponse);
    }

    if (member.community !== userToDelete.community) {
      failedResponse = failed_response(
        "Member does not belong to same community"
      );
      return res.status(403).json(failedResponse);
    }

    if (!MODIFY_ROLES.includes(member?.roleId?.name)) {
      failedResponse = failed_response("NOT_ALLOWED_ACCESS");
      return res.status(403).json(failedResponse);
    }

    await MemberModel.destroy({
      where: { id: memberToDelete },
    });

    return res.status(201).json({ status: true });
  } catch (err) {
    console.error(err);
    const failedResponse = failed_response("Internal Server Error");
    return res.status(500).json(failedResponse);
  }
}
