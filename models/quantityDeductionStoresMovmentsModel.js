const { DataTypes } = require("sequelize");

function defineQuantityDeductionStoresMovmentsModel(sequelize, models) {
	const QuantityDeductionStoresMovmentsModel = sequelize.define(
		"quantity_deductions_stores_movment",
		{
			prev_value: {
				type: DataTypes.BIGINT,
				allowNull: false,
			},
			curr_value: {
				type: DataTypes.BIGINT,
				allowNull: false,
			},
			store_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			quantity_deduction_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			movment_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			station_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			price: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		}
	);
	if (models) {
		if (models.StoreModel) {
			QuantityDeductionStoresMovmentsModel.belongsTo(models.StoreModel, {
				foreignKey: "store_id",
			});
		}
	}
	return QuantityDeductionStoresMovmentsModel;
}
module.exports = defineQuantityDeductionStoresMovmentsModel;

// const QuantityDeductionStoresMovmentsModel = sequelize.define(
// 	"quantity_deductions_stores_movment",
// 	{
// 		prev_value: {
// 			type: DataTypes.BIGINT,
// 			allowNull: false,
// 		},
// 		curr_value: {
// 			type: DataTypes.BIGINT,
// 			allowNull: false,
// 		},
// 		store_id: {
// 			type: DataTypes.INTEGER,
// 			allowNull: false,
// 		},
// 		quantity_deduction_id: {
// 			type: DataTypes.INTEGER,
// 			allowNull: false,
// 		},
// 		movment_id: {
// 			type: DataTypes.INTEGER,
// 			allowNull: false,
// 		},
// 		station_id: {
// 			type: DataTypes.INTEGER,
// 			allowNull: false,
// 		},
// 		price: {
// 			type: DataTypes.INTEGER,
// 			allowNull: false,
// 		},
// 	}
// );
// QuantityDeductionStoresMovmentsModel.belongsTo(StoreModel, {
// 	foreignKey: "store_id",
// });
// module.exports = QuantityDeductionStoresMovmentsModel;
