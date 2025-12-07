const { DataTypes } = require("sequelize");
// const sequelize = require("./../connection");
// const StationModel = require("./stationModel");

function defineMovmentModel(sequelize, models) {
	const MovmentModel = sequelize.define("movments", {
		date: {
			type: DataTypes.DATEONLY,
			allowNull: false,
			validate: {
				is: async function (value) {
					const existingRow = await MovmentModel.findOne({
						where: {
							date: value,
							station_id: this.station_id,
						},
					});
					if (existingRow) {
						throw new Error(`تم ادخال الحركة بتاريخ ${value}`);
					}
				},
			},
		},
		number: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				isUnique: async function (value) {
					const existingRow = await MovmentModel.findOne({
						where: { number: value },
					});
					if (existingRow) {
						throw new Error(`توجد حركة بالرقم ${value}`);
					}
				},
			},
		},
		station_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		state: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		shifts: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		has_stocktaking: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		stocktaking_id: {
			type: DataTypes.INTEGER,
		},
		quantity_deduction_id: {
			type: DataTypes.INTEGER,
		},
	});
	if (models) {
		if (models.StationModel) {
			MovmentModel.belongsTo(models.StationModel, { foreignKey: "station_id" });
		}
	}
	return MovmentModel;
}
module.exports = defineMovmentModel;

// const MovmentModel = sequelize.define("movments", {
// 	date: {
// 		type: DataTypes.DATEONLY,
// 		allowNull: false,
// 		validate: {
// 			is: async function (value) {
// 				const existingRow = await MovmentModel.findOne({
// 					where: {
// 						date: value,
// 						station_id: this.station_id,
// 					},
// 				});
// 				if (existingRow) {
// 					throw new Error(`تم ادخال الحركة بتاريخ ${value}`);
// 				}
// 			},
// 		},
// 	},
// 	number: {
// 		type: DataTypes.STRING,
// 		allowNull: false,
// 		unique: true,
// 		validate: {
// 			isUnique: async function (value) {
// 				const existingRow = await MovmentModel.findOne({
// 					where: { number: value },
// 				});
// 				if (existingRow) {
// 					throw new Error(`توجد حركة بالرقم ${value}`);
// 				}
// 			},
// 		},
// 	},
// 	station_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	state: {
// 		type: DataTypes.STRING,
// 		allowNull: false,
// 	},
// 	shifts: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	has_stocktaking: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	stocktaking_id: {
// 		type: DataTypes.INTEGER,
// 	},
// 	quantity_deduction_id: {
// 		type: DataTypes.INTEGER,
// 	},
// });
// MovmentModel.belongsTo(StationModel, { foreignKey: "station_id" });
// module.exports = MovmentModel;
