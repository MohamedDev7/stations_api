const { Sequelize } = require("sequelize");
const sequelize = new Sequelize("stations", "root", "717252160", {
	host: "localhost",
	dialect: "mysql",
	logging: false,
});
// const sequelize = new Sequelize(
// 	"stations",
// 	"dbmasteruser",
// 	"2fG(_D-DA:=[43W2-oQtGxioNMz*.R-s",
// 	{
// 		host: "ls-12942930cd77cb4c66c8acae55241ef5ac1168a6.c3yuue6mwwdu.us-east-1.rds.amazonaws.com",
// 		dialect: "mysql",
// 		logging: false,
// 	}
// );
module.exports = sequelize;
