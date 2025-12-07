const { DataTypes } = require("sequelize");
function defineUnauthorizedDevice(sequelize) {
	const UnauthorizedDevice = sequelize.define("unauthorized_device", {
		device_id: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	});
	return UnauthorizedDevice;
}
module.exports = defineUnauthorizedDevice;
// const sequelize = require("./../connection");
// const UnauthorizedDevice = sequelize.define("unauthorized_device", {
// 	device_id: {
// 		type: DataTypes.STRING,
// 		allowNull: false,
// 	},
// });
// module.exports = UnauthorizedDevice;
