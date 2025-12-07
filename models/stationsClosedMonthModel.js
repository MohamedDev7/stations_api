const { DataTypes } = require("sequelize");

function defineShiftModel(sequelize, models) {
	const stationsClosedMonthModel = sequelize.define("stations_closed_month", {
		station_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		month: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		isClosed: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	});
	if (models) {
		if (models.StationModel) {
			stationsClosedMonthModel.belongsTo(models.StationModel, {
				foreignKey: "station_id",
			});
		}
	}
	return stationsClosedMonthModel;
}
module.exports = defineShiftModel;

// const stationsClosedMonthModel = sequelize.define("stations_closed_month", {
// 	station_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	month: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	isClosed: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// });
// stationsClosedMonthModel.belongsTo(StationModel, { foreignKey: "station_id" });
// module.exports = stationsClosedMonthModel;
