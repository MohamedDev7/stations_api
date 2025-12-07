const { DataTypes } = require("sequelize");

function defineReceiveModel(sequelize, models) {
	const ReceivesModel = sequelize.define("receive", {
		station_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		date: {
			type: DataTypes.DATEONLY,
			allowNull: false,
		},
		amount: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		employee_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		user_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		title: {
			type: DataTypes.STRING,
		},
	});
	if (models) {
		if (models.StationModel) {
			ReceivesModel.belongsTo(models.StationModel, {
				foreignKey: "station_id",
			});
		}
		if (models.EmployeesModel) {
			ReceivesModel.belongsTo(models.EmployeesModel, {
				foreignKey: "employee_id",
			});
		}
	}
	return ReceivesModel;
}
module.exports = defineReceiveModel;

// const ReceivesModel = sequelize.define("receive", {
// 	station_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	date: {
// 		type: DataTypes.DATEONLY,
// 		allowNull: false,
// 	},
// 	amount: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	employee_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	user_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	title: {
// 		type: DataTypes.STRING,
// 	},
// });
// ReceivesModel.belongsTo(StationModel, { foreignKey: "station_id" });
// ReceivesModel.belongsTo(EmployeesModel, { foreignKey: "employee_id" });
// module.exports = ReceivesModel;
