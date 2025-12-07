const { DataTypes } = require("sequelize");

function defineUserDeviceModel(sequelize) {
	const UserDeviceModel = sequelize.define(
		"user_device",
		{
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
	return UserDeviceModel;
}
module.exports = defineUserDeviceModel;

// const sequelize = require("./../connection");
// const UserDeviceModel = sequelize.define(
// 	"user_device",
// 	{
// 		// Model attributes are defined here
// 		user_id: {
// 			type: DataTypes.INTEGER,
// 			allowNull: false,
// 		},
// 		device_id: {
// 			type: DataTypes.INTEGER,
// 			allowNull: false,
// 		},
// 	},
// 	{ timestamps: false }
// );
// module.exports = UserDeviceModel;
