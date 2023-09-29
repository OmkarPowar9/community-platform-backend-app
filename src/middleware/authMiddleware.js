import jwt from "jsonwebtoken";
import { failed_response } from "../utils/response.js";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  // Fetching the authentication token from headers
  const token = req.header("Authorization").split(" ")[1];

  if (token == null || token === "") {
    return res.json(
      failed_response(401, "Please authenticate using valid token")
    );
  }

  try {
    // User verification
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decodedToken?.id, {
      attributes: { exclude: ["password"] },
    });

    if (user === undefined || user === null) {
      return res.status(403).json(failed_response(403, "Unauthorized access"));
    }

    req.user = user.dataValues;

    next();
  } catch (error) {
    return res.status(401).json(failed_response(401, error.message));
  }
};

export default authMiddleware;
