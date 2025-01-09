const { Sequelize } = require("sequelize");
const sequelize = new Sequelize("stations", "root", "717252160", {
	host: "localhost",
	dialect: "mysql",
	logging: false,
});
module.exports = sequelize;
