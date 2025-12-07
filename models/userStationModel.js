const { DataTypes } = require("sequelize");
function defineUserStationModel(sequelize) {
	const UserStationModel = sequelize.define(
		"user_station",
		{
			user_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			station_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{ timestamps: false }
	);
	return UserStationModel;
}
module.exports = defineUserStationModel;
// const sequelize = require("./../connection");
// const UserStationModel = sequelize.define(
// 	"user_station",
// 	{
// 		// Model attributes are defined here
// 		user_id: {
// 			type: DataTypes.INTEGER,
// 			allowNull: false,
// 		},
// 		station_id: {
// 			type: DataTypes.INTEGER,
// 			allowNull: false,
// 		},
// 	},
// 	{ timestamps: false }
// );
// module.exports = UserStationModel;
