const { DataTypes } = require("sequelize");
// const sequelize = require("./../connection");
// const StationModel = require("./stationModel");

function defineEmployeeModel(sequelize, models) {
	const EmployeesModel = sequelize.define("employee", {
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		station_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	});
	if (models) {
		if (models.StationModel) {
			EmployeesModel.belongsTo(models.StationModel, {
				foreignKey: "station_id",
			});
		}
	}
	return EmployeesModel;
}
module.exports = defineEmployeeModel;

// const EmployeesModel = sequelize.define("employee", {
// 	name: {
// 		type: DataTypes.STRING,
// 		allowNull: false,
// 	},
// 	station_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// });
// EmployeesModel.belongsTo(StationModel, { foreignKey: "station_id" });
// module.exports = EmployeesModel;
