import Sequelize from "sequelize";
import schema from "../utils/db.js";

const roleSchema = schema.define(
  "roles",
  {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
    },

    name: {
      type: Sequelize.STRING(64),
      allowNull: false,
      unique: true,
    },
  },
  { timestamps: true }
);

export default roleSchema;
