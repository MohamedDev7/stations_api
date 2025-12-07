const { DataTypes } = require("sequelize");

function defineUserModel(sequelize) {
	const UserModel = sequelize.define(
		"user",
		{
			username: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			password: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			first_name: {
				type: DataTypes.STRING,
			},
			last_name: {
				type: DataTypes.STRING,
			},
			phone: {
				type: DataTypes.BIGINT,
			},
		},
		{ timestamps: false }
	);

	return UserModel;
}
module.exports = defineUserModel;

// const sequelize = require("./../connection");
// const AuditLogModel = require("./AuditLogsModel");
// const UserModel = sequelize.define(
// 	"user",
// 	{
// 		// Model attributes are defined here
// 		username: {
// 			type: DataTypes.STRING,
// 			allowNull: false,
// 		},
// 		password: {
// 			type: DataTypes.STRING,
// 			allowNull: false,
// 		},
// 		first_name: {
// 			type: DataTypes.STRING,
// 		},
// 		last_name: {
// 			type: DataTypes.STRING,
// 		},
// 		phone: {
// 			type: DataTypes.BIGINT,
// 		},
// 	},
// 	{ timestamps: false }
// );

// module.exports = UserModel;
