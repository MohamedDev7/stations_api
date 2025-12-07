const { DataTypes } = require("sequelize");
// const sequelize = require("./../connection");

function definePermissionModel(sequelize) {
	const PermissionModel = sequelize.define(
		"permission",
		{
			// Model attributes are defined here
			user_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			permission: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{ timestamps: false }
	);
	return PermissionModel;
}
module.exports = definePermissionModel;

// const PermissionModel = sequelize.define(
// 	"permission",
// 	{
// 		// Model attributes are defined here
// 		user_id: {
// 			type: DataTypes.INTEGER,
// 			allowNull: false,
// 		},
// 		permission: {
// 			type: DataTypes.STRING,
// 			allowNull: false,
// 		},
// 	},
// 	{ timestamps: false }
// );
// module.exports = PermissionModel;
