import { failed_response, success_response } from "../utils/response.js";
import Role from "../models/Role.js";
import { Snowflake } from "@theinternetfolks/snowflake";
import { validationResult } from "express-validator";

export async function createRole(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name } = req.body;

    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole !== null) {
      const failedResponse = failed_response(
        "Role already exists with this name"
      );
      return res.status(400).json(failedResponse);
    }

    const roleId = Snowflake.generate();
    const role = await Role.create({
      id: roleId,
      name,
    });

    const content = {
      data: {
        ...role.dataValues,
      },
    };

    const response = success_response("Role created successfully", content);
    return res.status(201).json(response);
  } catch (err) {
    const failedResponse = failed_response("Internal Server Error");
    return res.status(500).json(failedResponse);
  }
}

export async function fetchAllRoles(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;
    const totalRoles = await Role.findAndCountAll();
    const totalPages = Math.ceil(totalRoles.count / limit);

    const roles = await Role.findAll({ limit, offset });

    const content = {
      meta: {
        total: totalRoles.count,
        pages: totalPages,
        page,
      },
      data: roles,
    };

    const response = success_response("Roles fetched successfully", content);
    return res.status(200).json(response);
  } catch (err) {
    const failedResponse = failed_response("Internal Server Error");
    return res.status(500).json(failedResponse);
  }
}
