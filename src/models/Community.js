import Sequelize from "sequelize";
import schema from "../utils/db.js";
import userSchema from "./User.js";

const communitySchema = schema.define(
  "community",
  {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
    },

    name: {
      type: Sequelize.STRING(128),
      allowNull: false,
    },

    slug: {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true,
    },

    owner: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  { timestamps: true }
);

communitySchema.hasMany(userSchema, {
  foreignKey: "id",
  sourceKey: "owner",
});

export default communitySchema;
