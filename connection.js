const { Sequelize } = require("sequelize");
require("mysql2");

const DB_USER = "dbmasteruser";
const DB_PASSWORD = "_lghZJ6|;PqTTnYe]u#:.lGd8T[s[g+3";
const DB_HOST =
	"ls-1ada03ee45cdd8a0ed9baeb1c069264a5f10460b.corwca8u2qpj.us-east-1.rds.amazonaws.com";

// Main stations database (current year)
const sequelizeStations2025 = new Sequelize(
	"stations-2025",
	DB_USER,
	DB_PASSWORD,
	{
		host: DB_HOST,
		dialect: "mysql",
		logging: false,
	},
);
const sequelizeStations2026 = new Sequelize(
	"stations-2026",
	DB_USER,
	DB_PASSWORD,
	{
		host: DB_HOST,
		dialect: "mysql",
		logging: false,
	},
);

// Add year-based databases here manually
// Example: const sequelizeStations2023 = new Sequelize("stations-2023", DB_USER, DB_PASSWORD, { host: DB_HOST, dialect: "mysql", logging: false });

module.exports = {
	sequelizeStations2025,
	sequelizeStations2026,
};
// const { Sequelize } = require("sequelize");
// require("mysql2");
// const sequelizeStations = new Sequelize("elec", "root", "717252160", {
// 	host: "localhost",
// 	dialect: "mysql",
// 	logging: false,
// });

// module.exports = {
// 	sequelizeStations,
// };
