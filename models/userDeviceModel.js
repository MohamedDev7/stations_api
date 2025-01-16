const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");
const UserDeviceModel = sequelize.define(
	"user_device",
	{
		// Model attributes are defined here
		user_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		device_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	},
	{ timestamps: false }
);
module.exports = UserDeviceModel;
