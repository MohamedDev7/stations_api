const { Op } = require("sequelize");
const { getModel } = require("./utils/modelSelect");
const sequelize = require("./connection");

async function debug() {
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

        const startDate = "2026/02/01";
        const stationId = 7; // محطة الغيضة النموذجية (2)

        const pastMovments = await MovmentModel.findAll({ attributes: ["id", "station_id"], where: { date: { [Op.lt]: startDate } }, raw: true });
        const pastMovmentsIds = pastMovments.map(m => m.id);
        const myStationPastMovmentsIds = pastMovments.filter(m => m.station_id === stationId).map(m => m.id);

        const checkModel = async (Model, attributes, whereOpts, calcSum) => {
            // Bulk
            let records = await Model.findAll({
                attributes,
                where: whereOpts.bulk,
                include: whereOpts.include || [],
                raw: true
            });
            let myRecords = records.filter(el => el.station_id === stationId);
            let bulkSum = calcSum(myRecords);

            // Orig
            let origRecords = await Model.findAll({
                where: whereOpts.orig,
                include: whereOpts.origInclude || whereOpts.include || [],
                raw: true
            });
            let origSum = calcSum(origRecords);

            return { bulkSum, origSum, diff: origSum - bulkSum };
        };

        const resIncomes = await checkModel(
            IncomeModel, 
            ["station_id", "amount", "price"], 
            {
                bulk: { movment_id: { [Op.in]: pastMovmentsIds }, type: "income" },
                orig: { station_id: stationId, movment_id: { [Op.in]: myStationPastMovmentsIds }, type: "income" },
                include: [{ model: StoreModel, attributes: [], where: { type: "نقدي" } }],
                origInclude: [{ model: StoreModel, include: [{ model: SubstanceModel, attributes: ["name"] }], where: { type: "نقدي" } }]
            },
            (arr) => arr.reduce((sum, el) => sum + el.amount * el.price, 0)
        );

        const resSurplus = await checkModel(
            SurplusModel, 
            ["station_id", "amount", "price"], 
            {
                bulk: { is_annual_stocktaking: 0, movment_id: { [Op.in]: pastMovmentsIds } },
                orig: { station_id: stationId, is_annual_stocktaking: 0, movment_id: { [Op.in]: myStationPastMovmentsIds } },
                include: [{ model: StoreModel, attributes: [], where: { type: "نقدي" } }],
                origInclude: [{ model: StoreModel, include: [{ model: SubstanceModel, attributes: ["name"] }], where: { type: "نقدي" } }]
            },
            (arr) => arr.reduce((sum, el) => sum + el.amount * el.price, 0)
        );

        const resFinOpsD = await checkModel(
            FinancialOperationsModel,
            ["station_id", "debtor"],
            {
                bulk: { date: { [Op.lt]: startDate } },
                orig: { station_id: stationId, date: { [Op.lt]: startDate } }
            },
            (arr) => arr.reduce((sum, el) => sum + (+el.debtor || 0), 0)
        );

        const resFinOpsC = await checkModel(
            FinancialOperationsModel,
            ["station_id", "creditor"],
            {
                bulk: { date: { [Op.lt]: startDate } },
                orig: { station_id: stationId, date: { [Op.lt]: startDate } }
            },
            (arr) => arr.reduce((sum, el) => sum + (+el.creditor || 0), 0)
        );

        const resDeposit = await checkModel(
            DepositModel,
            ["station_id", "amount"],
            {
                bulk: { invoice_date: { [Op.lt]: startDate } },
                orig: { station_id: stationId, invoice_date: { [Op.lt]: startDate } }
            },
            (arr) => arr.reduce((sum, el) => sum + el.amount, 0)
        );

        const resCreditSaleSet = await checkModel(
            CreditSaleSettlementModel,
            ["station_id", "amount"],
            {
                bulk: { date: { [Op.lt]: startDate }, type: "قيد مالي" },
                orig: { station_id: stationId, date: { [Op.lt]: startDate }, type: "قيد مالي" }
            },
            (arr) => arr.reduce((sum, el) => sum + el.amount, 0)
        );

        const resPriceMovD = await checkModel(
            priceMovmentEntriesModel,
            ["station_id", "debtor"],
            {
                bulk: { date: { [Op.lt]: startDate } },
                orig: { station_id: stationId, date: { [Op.lt]: startDate } }
            },
            (arr) => arr.reduce((sum, el) => sum + (+el.debtor || 0), 0)
        );

        const resPriceMovC = await checkModel(
            priceMovmentEntriesModel,
            ["station_id", "creditor"],
            {
                bulk: { date: { [Op.lt]: startDate } },
                orig: { station_id: stationId, date: { [Op.lt]: startDate } }
            },
            (arr) => arr.reduce((sum, el) => sum + (+el.creditor || 0), 0)
        );

        const resQuantDeduct = await checkModel(
            QuantityDeductionModel,
            ["station_id", "amount", "price"],
            {
                bulk: { date: { [Op.lt]: startDate }, with_value: { [Op.ne]: 0 } },
                orig: { station_id: stationId, date: { [Op.lt]: startDate }, with_value: { [Op.ne]: 0 } }
            },
            (arr) => arr.reduce((sum, el) => sum + el.amount * el.price, 0)
        );

        console.log("Incomes Diff:", resIncomes.diff, resIncomes);
        console.log("Surplus Diff:", resSurplus.diff, resSurplus);
        console.log("FinOps Debtor Diff:", resFinOpsD.diff, resFinOpsD);
        console.log("FinOps Creditor Diff:", resFinOpsC.diff, resFinOpsC);
        console.log("Deposit Diff:", resDeposit.diff, resDeposit);
        console.log("CreditSaleSet Diff:", resCreditSaleSet.diff, resCreditSaleSet);
        console.log("PriceMov Debtor Diff:", resPriceMovD.diff, resPriceMovD);
        console.log("PriceMov Creditor Diff:", resPriceMovC.diff, resPriceMovC);
        console.log("QuantDeduct Diff:", resQuantDeduct.diff, resQuantDeduct);

	} catch (e) {
		console.error(e);
	}
    process.exit(0);
}
debug();
