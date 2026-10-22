const sequelize = require("./connection");

async function check() {
	try {
        for (const [year, db] of [['2026', sequelize.sequelizeStations2026], ['2025', sequelize.sequelizeStations2025]]) {
            const [deps] = await db.query("SELECT * FROM deposits WHERE amount = 55504300");
            if (deps.length) console.log(year, "deposits:", deps);

            const [sums] = await db.query("SELECT station_id, SUM(amount) as s FROM deposits WHERE invoice_date LIKE '" + year + "-09%' GROUP BY station_id");
            sums.forEach(s => {
                if (s.s == 55504300 || s.s.toString().includes("55504")) console.log(year, "matching sum:", s);
            });

            // Check if any station 7 deposits sum up to 55504300
            const [st7Deps] = await db.query("SELECT * FROM deposits WHERE station_id = 7 AND invoice_date LIKE '" + year + "-09%'");
            // check any subset
            console.log(year, "station 7 sept count:", st7Deps.length, "total:", st7Deps.reduce((acc, d) => acc + +d.amount, 0));
        }

        // Also check if station_id 2 in 2026 or station_number 2:
        const [st2_2026] = await sequelize.sequelizeStations2026.query("SELECT SUM(amount) as s FROM deposits WHERE station_id = 2 AND invoice_date LIKE '2026-09%'");
        console.log("Station ID 2 2026-09:", st2_2026);

        // Check if there is any calculation:
        // What is 100,780,600 - 55,504,300? 45,276,300
        // What is 82,037,460?
	} catch (e) {
		console.error(e);
	}
    process.exit(0);
}
check();
