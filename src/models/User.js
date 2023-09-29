import Sequelize from "sequelize";
import schema from "../utils/db.js";

const userSchema = schema.define(
  "users",
  {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
    },

    name: {
      type: Sequelize.STRING(64),
      defaultValue: null,
    },

    email: {
      type: Sequelize.STRING(128),
      allowNull: false,
      unique: true,
    },

    password: {
      type: Sequelize.STRING(64),
      allowNull: false,
    },
  },
  { timestamps: true }
);

export default userSchema;
