const { DataTypes } = require("sequelize");

function defineStationModel(sequelize) {
	const StationModel = sequelize.define("station", {
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		shifts: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		number: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		province: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		supervisor: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		start_date: {
			type: DataTypes.DATEONLY,
		},
	});
	return StationModel;
}
module.exports = defineStationModel;

// const StationModel = sequelize.define("station", {
// 	name: {
// 		type: DataTypes.STRING,
// 		allowNull: false,
// 	},
// 	shifts: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	number: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	province: {
// 		type: DataTypes.STRING,
// 		allowNull: false,
// 	},
// 	supervisor: {
// 		type: DataTypes.STRING,
// 		allowNull: false,
// 	},
// 	start_date: {
// 		type: DataTypes.DATEONLY,
// 	},
// });

// module.exports = StationModel;
