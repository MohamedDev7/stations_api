const { Op } = require("sequelize");
const { getModel } = require("./utils/modelSelect");

async function check() {
	try {
        const req = { year: "2026" };
        const IncomeModel = getModel(req.year, "income");
        
        const records = await IncomeModel.findAll({
            where: { station_id: 7 },
            raw: true
        });

        let types = {};
        records.forEach(r => {
            if (!types[r.type]) types[r.type] = 0;
            types[r.type] += r.amount * r.price;
        });

        console.log("Income types by value:", types);

	} catch (e) {
		console.error(e);
	}
    process.exit(0);
}
check();
