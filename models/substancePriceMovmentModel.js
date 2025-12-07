const { DataTypes } = require("sequelize");

function defineSubstancePriceMovmentModel(sequelize) {
	const SubstancePriceMovmentModel = sequelize.define(
		"substance_price_movment",
		{
			substance_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			start_date: {
				type: DataTypes.DATEONLY,
				allowNull: false,
			},
			end_date: {
				type: DataTypes.DATEONLY,
			},
			price: {
				type: DataTypes.BIGINT,
				allowNull: false,
			},
			prev_price: {
				type: DataTypes.BIGINT,
				allowNull: false,
			},
			number: { type: DataTypes.INTEGER, allowNull: false },
			type: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		}
	);
	return SubstancePriceMovmentModel;
}
module.exports = defineSubstancePriceMovmentModel;

// const sequelize = require("./../connection");

// const SubstancePriceMovmentModel = sequelize.define("substance_price_movment", {
// 	substance_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	start_date: {
// 		type: DataTypes.DATEONLY,
// 		allowNull: false,
// 	},
// 	end_date: {
// 		type: DataTypes.DATEONLY,
// 	},
// 	price: {
// 		type: DataTypes.BIGINT,
// 		allowNull: false,
// 	},
// 	prev_price: {
// 		type: DataTypes.BIGINT,
// 		allowNull: false,
// 	},
// 	number: { type: DataTypes.INTEGER, allowNull: false },
// 	type: {
// 		type: DataTypes.STRING,
// 		allowNull: false,
// 	},
// 	name: {
// 		type: DataTypes.STRING,
// 		allowNull: false,
// 	},
// });

// module.exports = SubstancePriceMovmentModel;
