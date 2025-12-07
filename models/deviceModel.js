const { DataTypes } = require("sequelize");
// const sequelize = require("./../connection");

function defineDeviceModel(sequelize) {
	const DeviceModel = sequelize.define(
		"device",
		{
			// Model attributes are defined here
			title: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			device_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{ timestamps: false }
	);
	return DeviceModel;
}
module.exports = defineDeviceModel;

// const DeviceModel = sequelize.define(
// 	"device",
// 	{
// 		// Model attributes are defined here
// 		title: {
// 			type: DataTypes.STRING,
// 			allowNull: false,
// 		},
// 		device_id: {
// 			type: DataTypes.INTEGER,
// 			allowNull: false,
// 		},
// 	},
// 	{ timestamps: false }
// );
// module.exports = DeviceModel;
