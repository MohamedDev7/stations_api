const { DataTypes } = require("sequelize");

function defineShiftModel(sequelize) {
	const ShiftModel = sequelize.define("shifts", {
		start: {
			type: DataTypes.TIME,
			allowNull: false,
		},
		end: {
			type: DataTypes.TIME,
			allowNull: false,
		},
		number: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		station_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	});

	return ShiftModel;
}
module.exports = defineShiftModel;

// const ShiftModel = sequelize.define("shifts", {
// 	start: {
// 		type: DataTypes.TIME,
// 		allowNull: false,
// 	},
// 	end: {
// 		type: DataTypes.TIME,
// 		allowNull: false,
// 	},
// 	number: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	station_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// });
// module.exports = ShiftModel;
