const { DataTypes } = require("sequelize");
// const sequelize = require("./../connection");
// const TankModel = require("./tankModel");
// const StationModel = require("./stationModel");

function defineQuantityDeductionMemberModel(sequelize, models) {
	const QuantityDeductionMemberModel = sequelize.define(
		"quantity_deduction_member",
		{
			quantity_deduction_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		}
	);
	return QuantityDeductionMemberModel;
}

module.exports = defineQuantityDeductionMemberModel;
