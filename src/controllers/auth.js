import { failed_response, success_response } from "../utils/response.js";
import User from "../models/User.js";
import {
  encryptPassword,
  getAuthToken,
  isCorrectPassword,
} from "../utils/passwordUtil.js";
import { Snowflake } from "@theinternetfolks/snowflake";
import { validationResult } from "express-validator";

export async function userSignUp(req, res) {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser !== null) {
      return res.status(400).json(failed_response("User already exists"));
    }

    const hashedPassword = await encryptPassword(password);
    const userId = Snowflake.generate();

    const newUser = await User.create(
      {
        id: userId,
        name,
        email,
        password: hashedPassword,
      },
      { returning: true }
    );

    const data = {
      id: newUser.id,
    };

    const token = await getAuthToken(data);

    const content = {
      data: {
        name: newUser.name,
        email: newUser.email,
        created_at: newUser.createdAt,
      },
      meta: {
        access_token: token,
      },
    };

    const response = success_response("User created successfully", content);
    return res.status(201).json(response);
  } catch (error) {
    const failedResponse = failed_response(500, "Internal Server Error");
    return res.status(500).json(failedResponse);
  }
}

export async function userSignIn(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (user === null) {
      const failedResponse = failed_response("User not found");
      return res.status(400).json(failedResponse);
    }

    const isPasswordValid = await isCorrectPassword(password, user?.password);

    if (!isPasswordValid) {
      const failedResponse = failed_response("Password is not correct");
      return res.status(400).json(failedResponse);
    }

    const data = { id: user.id };
    const token = await getAuthToken(data);

    const content = {
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.createdAt,
      },
      meta: {
        access_token: token,
      },
    };

    const response = success_response("Login successful", content);
    return res.status(200).json(response);
  } catch (error) {
    const failedResponse = failed_response(500, "Internal Server Error");
    return res.status(500).json(failedResponse);
  }
}

export async function getUser(req, res) {
  try {
    const content = {
      data: {
        ...req.user,
      },
    };

    const response = success_response("User retrieved", content);
    return res.status(200).json(response);
  } catch (error) {
    const failedResponse = failed_response(500, "Internal Server Error");
    return res.status(500).json(failedResponse);
  }
}
