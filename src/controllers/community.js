import { validationResult } from "express-validator";
import slug from "slug";
import { failed_response, success_response } from "../utils/response.js";
import CommunityModel from "../models/Community.js";
import UserModel from "../models/User.js";
import MemberModel from "../models/Member.js";
import RoleModel from "../models/Role.js";
import { Snowflake } from "@theinternetfolks/snowflake";

export async function createCommunity(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name } = req.body;

    const userSlug = slug(name);
    const existingCommunity = await CommunityModel.findOne({
      where: { name, slug: userSlug },
    });

    if (existingCommunity !== null) {
      const failedResponse = failed_response("Community already exists");
      return res.status(400).json(failedResponse);
    }

    const ownerId = req.user.id;
    const owner = await UserModel.findByPk(ownerId);
    if (owner === null || owner === undefined) {
      const failedResponse = failed_response("Owner not found");
      return res.status(404).json(failedResponse);
    }

    const communityId = Snowflake.generate();
    const community = await CommunityModel.create({
      id: communityId,
      name,
      slug: userSlug,
      owner: ownerId,
    });

    const content = {
      data: {
        ...community.dataValues,
      },
    };

    const response = success_response(
      "Community created successfully",
      content
    );
    return res.status(201).json(response);
  } catch (err) {
    const failedResponse = failed_response("Internal Server Error");
    return res.status(500).json(failedResponse);
  }
}

export async function fetchAllCommunities(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;
    const totalCommunities = await CommunityModel.findAndCountAll();
    const totalPages = Math.ceil(totalCommunities.count / limit);

    const communities = await CommunityModel.findAll({ limit, offset });

    const content = {
      meta: {
        total: totalCommunities.count,
        pages: totalPages,
        page,
      },
      data: communities,
    };

    const response = success_response(
      "Communities fetched successfully",
      content
    );
    return res.status(200).json(response);
  } catch (err) {
    console.error(err);
    const failedResponse = failed_response("Internal Server Error");
    return res.status(500).json(failedResponse);
  }
}

export async function fetchCommunityMembers(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const communityId = req.params.id;
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;
    const totalMembers = await MemberModel.findAndCountAll({
      where: { community: communityId },
    });
    const totalPages = Math.ceil(totalMembers.count / limit);

    let members = await MemberModel.findAll({
      limit,
      offset,
      where: {
        community: communityId,
      },
      include: [
        {
          foreignKey: "id",
          source: "user",
          as: "userId",
          model: UserModel,
          attributes: ["id", "name"],
        },
        {
          foreignKey: "id",
          source: "role",
          as: "roleId",
          model: RoleModel,
          attributes: ["id", "name"],
        },
      ],
    });

    members = members.map(
      ({
        dataValues: { id, community, user, role, roleId, userId, createdAt },
      }) => ({
        id,
        community,
        role: roleId,
        user: userId,
        created_at: createdAt,
      })
    );

    const content = {
      meta: {
        total: totalMembers.count,
        pages: totalPages,
        page,
      },
      data: members,
    };

    const response = success_response(
      "Communities fetched successfully",
      content
    );
    return res.status(200).json(response);
  } catch (err) {
    console.error(err);
    const failedResponse = failed_response("Internal Server Error");
    return res.status(500).json(failedResponse);
  }
}

export async function fetchOwnedCommunity(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;
    const totalCommunities = await CommunityModel.findAndCountAll({
      where: { community: communityId },
    });
    const totalPages = Math.ceil(totalCommunities.count / limit);

    const communities = await CommunityModel.findAll({
      limit,
      offset,
      where: {
        owner: req.user.id,
      },
    });

    const content = {
      meta: {
        total: totalCommunities.count,
        pages: totalPages,
        page,
      },
      data: communities,
    };

    const response = success_response(
      "Communities fetched successfully",
      content
    );
    return res.status(200).json(response);
  } catch (err) {
    console.error(err);
    const failedResponse = failed_response("Internal Server Error");
    return res.status(500).json(failedResponse);
  }
}

export async function fetchJoinedCommunity(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.user.id;
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;
    const totalJoinedCommunities = await MemberModel.findAndCountAll({
      where: { user: userId },
    });
    const totalPages = Math.ceil(totalJoinedCommunities.count / limit);

    const joinedCommunities = await MemberModel.findAll({
      where: { user: userId },
    });

    let communityIds = new Set();
    joinedCommunities.forEach(({ dataValues }) => {
      communityIds.add(dataValues.community);
    });

    communityIds = [...communityIds];

    let communities = await CommunityModel.findAll({
      offset,
      limit,
      where: { id: communityIds },
      include: {
        foreignKey: "id",
        source: "owner",
        model: UserModel,
        attributes: ["id", "name"],
      },
    });

    communities = communities.map(
      ({ id, slug, name, users, createdAt, updatedAt }) => ({
        id,
        name,
        slug,
        owner: users[0],
        created_at: createdAt,
        updated_at: updatedAt,
      })
    );

    const content = {
      meta: {
        total: totalJoinedCommunities.count,
        pages: totalPages,
        page,
      },
      data: communities,
    };

    const response = success_response(
      "Communities fetched successfully",
      content
    );
    return res.status(200).json(response);
  } catch (err) {
    console.error(err);
    const failedResponse = failed_response("Internal Server Error");
    return res.status(500).json(failedResponse);
  }
}
