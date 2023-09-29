import Sequelize from "sequelize";
import schema from "../utils/db.js";
import userSchema from "./User.js";
import roleSchema from "./Role.js";
import communitySchema from "./Community.js";

const memberSchema = schema.define(
  "members",
  {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
    },

    community: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    user: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    role: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  { timestamps: true }
);

memberSchema.hasOne(userSchema, {
  sourceKey: "user",
  as: "userId",
  foreignKey: "id",
});

memberSchema.hasOne(roleSchema, {
  sourceKey: "role",
  as: "roleId",
  foreignKey: "id",
});

memberSchema.hasOne(communitySchema, {
  sourceKey: "community",
  as: "communityId",
  foreignKey: "id",
});

export default memberSchema;
