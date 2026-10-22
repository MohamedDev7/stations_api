const { Op } = require("sequelize");
const { getModel } = require("./utils/modelSelect");
const sequelize = require("./connection");

async function search() {
	try {
        const db = sequelize.sequelizeStations2026;
        const [tables] = await db.query('SHOW TABLES');
        for (const t of tables) {
            const tbl = Object.values(t)[0];
            try {
                const [cols] = await db.query('SHOW COLUMNS FROM `' + tbl + '`');
                const colNames = cols.map(c => '`' + c.Field + '`').join(',');
                const [rows] = await db.query('SELECT * FROM `' + tbl + '` WHERE CONCAT_WS(" ", ' + colNames + ') LIKE "%55504%"');
                if (rows.length > 0) {
                    console.log('Found in', tbl, rows);
                }
            } catch(e) {}
        }

        // Also check if any sum of deposits = 55504300
        const [deps] = await db.query('SELECT * FROM deposits WHERE station_id = 7');
        console.log('Total deposits for station 7:', deps.length);
        // Check subsets of deposits in month 9:
        const [septDeps] = await db.query('SELECT * FROM deposits WHERE station_id = 7 AND invoice_date BETWEEN "2026-09-01" AND "2026-09-30"');
        console.log('Sept deps count:', septDeps.length, 'Sum:', septDeps.reduce((s, d) => s + +d.amount, 0));

	} catch (e) {
		console.error(e);
	}
    process.exit(0);
}
search();
