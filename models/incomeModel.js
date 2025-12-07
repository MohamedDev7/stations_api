const { DataTypes } = require("sequelize");
// const sequelize = require("./../connection");
// const StoreModel = require("./storeModel");
// const StationModel = require("./stationModel");
// const MovmentModel = require("./movmentModel");

function defineIncomeModel(sequelize, models) {
	const IncomeModel = sequelize.define("incomes", {
		amount: {
			type: DataTypes.BIGINT,
			allowNull: false,
		},
		store_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		tank_id: {
			type: DataTypes.INTEGER,
			// allowNull: false,
		},
		employee_id: {
			type: DataTypes.INTEGER,
			// allowNull: false,
		},
		station_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		movment_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		shift_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		truck_number: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		truck_driver: {
			type: DataTypes.STRING,
			allowNull: false,
		},

		type: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		state: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		price: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		doc_amount: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		doc_number: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		from: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	});
	if (models) {
		if (models.StoreModel) {
			IncomeModel.belongsTo(models.StoreModel, { foreignKey: "store_id" });
		}
		if (models.StationModel) {
			IncomeModel.belongsTo(models.StationModel, { foreignKey: "station_id" });
		}
		if (models.MovmentModel) {
			IncomeModel.belongsTo(models.MovmentModel, { foreignKey: "movment_id" });
		}
	}
	return IncomeModel;
}
module.exports = defineIncomeModel;

// const IncomeModel = sequelize.define("incomes", {
// 	amount: {
// 		type: DataTypes.BIGINT,
// 		allowNull: false,
// 	},
// 	store_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	tank_id: {
// 		type: DataTypes.INTEGER,
// 		// allowNull: false,
// 	},
// 	employee_id: {
// 		type: DataTypes.INTEGER,
// 		// allowNull: false,
// 	},
// 	station_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	movment_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	shift_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	truck_number: {
// 		type: DataTypes.STRING,
// 		allowNull: false,
// 	},
// 	truck_driver: {
// 		type: DataTypes.STRING,
// 		allowNull: false,
// 	},

// 	type: {
// 		type: DataTypes.STRING,
// 		allowNull: false,
// 	},
// 	state: {
// 		type: DataTypes.STRING,
// 		allowNull: false,
// 	},
// 	price: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	doc_amount: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	doc_number: {
// 		type: DataTypes.STRING,
// 		allowNull: false,
// 	},
// 	from: {
// 		type: DataTypes.STRING,
// 		allowNull: false,
// 	},
// });
// IncomeModel.belongsTo(StoreModel, { foreignKey: "store_id" });
// IncomeModel.belongsTo(StationModel, { foreignKey: "station_id" });
// IncomeModel.belongsTo(MovmentModel, { foreignKey: "movment_id" });
// module.exports = IncomeModel;
