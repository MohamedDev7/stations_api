const { DataTypes } = require("sequelize");
// const sequelize = require("./../connection");

function defineMovmentsShiftsModel(sequelize, models) {
	const MovmentsShiftsModel = sequelize.define("movments_shifts", {
		station_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		movment_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		number: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		start: {
			type: DataTypes.TIME,
			allowNull: false,
		},
		end: {
			type: DataTypes.TIME,
			allowNull: false,
		},
		state: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	});
	return MovmentsShiftsModel;
}
module.exports = defineMovmentsShiftsModel;

// const MovmentsShiftsModel = sequelize.define("movments_shift", {
// 	station_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	movment_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	number: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	start: {
// 		type: DataTypes.TIME,
// 		allowNull: false,
// 	},
// 	end: {
// 		type: DataTypes.TIME,
// 		allowNull: false,
// 	},
// 	state: {
// 		type: DataTypes.STRING,
// 		allowNull: false,
// 	},
// });

// module.exports = MovmentsShiftsModel;
