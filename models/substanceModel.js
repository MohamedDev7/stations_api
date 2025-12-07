const { DataTypes } = require("sequelize");

function defineSubstanceModel(sequelize) {
	const SubstanceModel = sequelize.define("substance", {
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	});
	return SubstanceModel;
}
module.exports = defineSubstanceModel;

// const sequelize = require("./../connection");

// const SubstanceModel = sequelize.define("substance", {
// 	name: {
// 		type: DataTypes.STRING,
// 		allowNull: false,
// 	},
// });

// module.exports = SubstanceModel;
