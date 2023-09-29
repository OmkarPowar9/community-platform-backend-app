import express, { urlencoded, json } from "express";
import morgan from "morgan";
import cors from "cors";
import { NODE_ENV } from "./config/index.js";
import authRoutes from "./routes/auth.js";
import roleRoutes from "./routes/role.js";
import communityRoutes from "./routes/community.js";
import memberRoutes from "./routes/member.js";

export function startServer() {
  const app = express();

  app.use(cors());
  app.use(urlencoded({ extended: true }));

  if (NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  app.use(json());

  app.get("/", async (req, res) => {
    res.send("Nothing found here");
  });

  app.use("/v1/auth", authRoutes);
  app.use("/v1/role", roleRoutes);
  app.use("/v1/community", communityRoutes);
  app.use("/v1/member", memberRoutes);

  return app;
}
