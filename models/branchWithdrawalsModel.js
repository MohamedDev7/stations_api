const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");
const StoreModel = require("./storeModel");
const MovmentModel = require("./movmentModel");
function defineBranchWithdrawalsModel(sequelize, models) {
	const BranchWithdrawalsModel = sequelize.define("branch_withdrawals", {
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
		store_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		store_movment_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		type: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		amount: {
			type: DataTypes.BIGINT,
			allowNull: false,
		},
		price: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		isSettled: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		settlement_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		employee_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	});
	if (models) {
		if (models.StoreModel) {
			BranchWithdrawalsModel.belongsTo(models.StoreModel, {
				foreignKey: "store_id",
			});
		}
		if (models.MovmentModel) {
			BranchWithdrawalsModel.belongsTo(models.MovmentModel, {
				foreignKey: "movment_id",
			});
		}
	}
	return BranchWithdrawalsModel;
}
module.exports = defineBranchWithdrawalsModel;
// const BranchWithdrawalsModel = sequelize.define("branch_withdrawals", {
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

// 	store_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	store_movment_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	type: {
// 		type: DataTypes.STRING,
// 		allowNull: false,
// 	},
// 	amount: {
// 		type: DataTypes.BIGINT,
// 		allowNull: false,
// 	},
// 	price: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	isSettled: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	settlement_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: true,
// 	},
// 	employee_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},

// });
// BranchWithdrawalsModel.belongsTo(StoreModel, { foreignKey: "store_id" });
// BranchWithdrawalsModel.belongsTo(MovmentModel, { foreignKey: "movment_id" });
// module.exports = BranchWithdrawalsModel;
