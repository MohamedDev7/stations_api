const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");
const PermissionModel = sequelize.define(
	"permission",
	{
		// Model attributes are defined here
		user_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		permission: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{ timestamps: false }
);
module.exports = PermissionModel;
