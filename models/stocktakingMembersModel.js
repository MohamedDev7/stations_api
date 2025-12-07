const { DataTypes } = require("sequelize");

function defineShiftModel(sequelize) {
	const StocktakingMembersModel = sequelize.define("stocktaking_member", {
		stocktaking_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	});
	return StocktakingMembersModel;
}

module.exports = defineShiftModel;
// const sequelize = require("./../connection");

// const StocktakingMembersModel = sequelize.define("stocktaking_member", {
// 	stocktaking_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	name: {
// 		type: DataTypes.STRING,
// 		allowNull: false,
// 	},
// });

// module.exports = StocktakingMembersModel;
