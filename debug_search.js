const { Op } = require("sequelize");
const { getModel } = require("./utils/modelSelect");
const sequelize = require("./connection");

async function search() {
	try {
        const req = { year: "2026" };
        const StationModel = getModel(req.year, "station");
		const MovmentModel = getModel(req.year, "movment");
		const IncomeModel = getModel(req.year, "income");
		const SubstanceModel = getModel(req.year, "substance");
		const StoreModel = getModel(req.year, "store");
		const SurplusModel = getModel(req.year, "surplus");
		const priceMovmentEntriesModel = getModel(req.year, "price_movment_entries");
		const DepositModel = getModel(req.year, "deposit");
		const FinancialOperationsModel = getModel(req.year, "financial_operations");
		const CreditSaleSettlementModel = getModel(req.year, "credit_sale_settlement");
		const QuantityDeductionModel = getModel(req.year, "quantity_deduction");
        const CalibrationModel = getModel(req.year, "calibration");
        const OtherModel = getModel(req.year, "other");
        const CreditSaleModel = getModel(req.year, "credit_sale");

        const target = 12972100;
        const stationId = 7; 

        // Let's just fetch everything for station 7 and see if any combination or single record equals 12972100

        const checkSum = async (Model, name, dateField) => {
            let where = {};
            if (dateField) where[dateField] = { [Op.lt]: '2026/02/01' };
            try {
                const records = await Model.findAll({ where, raw: true });
                let sum = 0;
                let myRecs = [];
                for(let r of records) {
                    if (r.station_id === stationId) {
                        myRecs.push(r);
                        if (r.amount !== undefined && r.price !== undefined) sum += r.amount * r.price;
                        else if (r.amount !== undefined) sum += r.amount;
                        else if (r.debtor !== undefined) sum += +r.debtor;
                    } else if (r.movment_id && !r.station_id) { // maybe station_id is through movment?
                        // let's skip for now
                    }
                }
                console.log(name, "Sum:", sum, "Count:", myRecs.length);
            } catch(e) {}
        }

        await checkSum(CalibrationModel, "Calibration", "date");
        await checkSum(OtherModel, "Other", "date");
        await checkSum(CreditSaleModel, "CreditSale", null);

	} catch (e) {
		console.error(e);
	}
    process.exit(0);
}
search();
