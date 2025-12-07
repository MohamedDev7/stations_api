const { DataTypes } = require("sequelize");
// const sequelize = require("./../connection");
// const DispenserModel = require("./dispenserModel");

function defineDispenserWheelCounterMovmentModel(sequelize, models) {
	const DispenserWheelCounterMovmentModel = sequelize.define(
		"dispensers_wheel_counter_movment",
		{
			station_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			movment_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			dispenser_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},

			prev_A: {
				type: DataTypes.BIGINT,
				allowNull: false,
			},
			curr_A: {
				type: DataTypes.BIGINT,
				allowNull: false,
			},
			prev_B: {
				type: DataTypes.BIGINT,
				allowNull: false,
			},
			curr_B: {
				type: DataTypes.BIGINT,
				allowNull: false,
			},
		}
	);
	if (models) {
		if (models.DispenserModel) {
			DispenserWheelCounterMovmentModel.belongsTo(models.DispenserModel, {
				foreignKey: "dispenser_id",
			});
		}
	}
	return DispenserWheelCounterMovmentModel;
}

module.exports = defineDispenserWheelCounterMovmentModel;
// const DispenserWheelCounterMovmentModel = sequelize.define(
// 	"dispensers_wheel_counter_movment",
// 	{
// 		station_id: {
// 			type: DataTypes.INTEGER,
// 			allowNull: false,
// 		},
// 		movment_id: {
// 			type: DataTypes.INTEGER,
// 			allowNull: false,
// 		},
// 		dispenser_id: {
// 			type: DataTypes.INTEGER,
// 			allowNull: false,
// 		},

// 		prev_A: {
// 			type: DataTypes.BIGINT,
// 			allowNull: false,
// 		},
// 		curr_A: {
// 			type: DataTypes.BIGINT,
// 			allowNull: false,
// 		},
// 		prev_B: {
// 			type: DataTypes.BIGINT,
// 			allowNull: false,
// 		},
// 		curr_B: {
// 			type: DataTypes.BIGINT,
// 			allowNull: false,
// 		},
// 	},
// 	{ freezeTableName: true }
// );
// DispenserWheelCounterMovmentModel.belongsTo(DispenserModel, {
// 	foreignKey: "dispenser_id",
// });
// module.exports = DispenserWheelCounterMovmentModel;
