const { DataTypes } = require("sequelize");
// const sequelize = require("./../connection");
// const StoreModel = require("./storeModel");
// const MovmentModel = require("./movmentModel");

function defineOtherModel(sequelize, models) {
	const OtherModel = sequelize.define("others", {
		amount: {
			type: DataTypes.BIGINT,
			allowNull: false,
		},
		title: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		store_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
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
		type: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		price: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		employee_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		settlement_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
	});
	if (models) {
		if (models.StoreModel) {
			OtherModel.belongsTo(models.StoreModel, { foreignKey: "store_id" });
		}
		if (models.MovmentModel) {
			OtherModel.belongsTo(models.MovmentModel, { foreignKey: "movment_id" });
		}
	}
	return OtherModel;
}
module.exports = defineOtherModel;
// const OtherModel = sequelize.define("others", {
// 	amount: {
// 		type: DataTypes.BIGINT,
// 		allowNull: false,
// 	},
// 	title: {
// 		type: DataTypes.STRING,
// 		allowNull: false,
// 	},
// 	store_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
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

// 	type: {
// 		type: DataTypes.STRING,
// 		allowNull: false,
// 	},
// 	price: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	employee_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	settlement_id: {
// 		type: DataTypes.INTEGER,
// 	},
// });
// OtherModel.belongsTo(StoreModel, { foreignKey: "store_id" });
// OtherModel.belongsTo(MovmentModel, { foreignKey: "movment_id" });
// module.exports = OtherModel;
