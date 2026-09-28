const catchAsync = require("../utils/catchAsync");
const sequelize = require("./../connection");
const AppError = require("../utils/appError");
const { getModel } = require("../utils/modelSelect");

const { Sequelize, Op, fn, col, literal, where } = require("sequelize");
const tafqeet = require("../utils/Tafqeet");

exports.getStoresMovmentInPeriod = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const MovmentModel = getModel(req.year, "movment");
			const StationModel = getModel(req.year, "station");
			const SubstanceModel = getModel(req.year, "substance");
			const StoreModel = getModel(req.year, "store");
			const StoreMovmentModel = getModel(req.year, "store_movment");
			const IncomeModel = getModel(req.year, "income");
			const CreditSaleModel = getModel(req.year, "credit_sale");
			// const CreditSaleSettlementModel = getModel(
			// 	req.year,
			// 	"credit_sale_settlement"
			// );
			const CalibrationModel = getModel(req.year, "calibration");
			const OtherModel = getModel(req.year, "other");
			const SurplusModel = getModel(req.year, "surplus");
			const MovmentsShiftsModel = getModel(req.year, "movments_shift");
			const movments = await MovmentModel.findAll({
				where: {
					station_id: req.query.station,
					date: {
						[Op.between]: [req.query.startDate, req.query.endDate],
					},
				},
				raw: true,
				transaction: t,
			});
			const station = await StationModel.findAll({
				where: {
					id: req.query.station,
				},
				raw: true,
				transaction: t,
			});
			const substance = await SubstanceModel.findByPk(req.query.substance);

			const movmentsIds = movments.map((el) => el.id);
			const shifts = await MovmentsShiftsModel.findAll({
				where: {
					movment_id: {
						[Op.in]: movmentsIds,
					},
				},
				raw: true,
			});
			const incomes = await IncomeModel.findAll({
				where: {
					station_id: req.query.station,
					movment_id: {
						[Op.in]: movmentsIds,
					},
					"$store.substance_id$": req.query.substance, // Filter by substance_id
				},
				include: [
					{
						model: StoreModel,
						attributes: [],
						required: true,
					},
				],
				attributes: [
					"movment_id",
					[req.db.fn("SUM", req.db.col("amount")), "total_amount"],
				],
				group: ["movment_id"],
				raw: true,
				transaction: t,
			});
			const surplus = await SurplusModel.findAll({
				where: {
					station_id: req.query.station,
					movment_id: {
						[Op.in]: movmentsIds,
					},
					is_annual_stocktaking: 0,
					"$store.substance_id$": req.query.substance, // Filter by substance_id
				},
				include: [
					{
						model: StoreModel,
						attributes: [],
						required: true,
					},
				],
				attributes: [
					"movment_id",
					[req.db.fn("SUM", req.db.col("amount")), "total_amount"],
				],
				group: ["movment_id"],
				raw: true,
				transaction: t,
			});

			const others = await OtherModel.findAll({
				where: {
					station_id: req.query.station,
					movment_id: {
						[Op.in]: movmentsIds,
					},
					"$store.substance_id$": req.query.substance, // Filter by substance_id
				},
				include: [
					{
						model: StoreModel,
						attributes: [],
						required: true,
					},
				],
				attributes: [
					"movment_id",

					[req.db.fn("SUM", req.db.col("amount")), "total_amount"],
				],
				group: ["movment_id"],
				raw: true,
				transaction: t,
			});
			const calibrations = await CalibrationModel.findAll({
				where: {
					station_id: req.query.station,
					movment_id: {
						[Op.in]: movmentsIds,
					},
					"$store.substance_id$": req.query.substance, // Filter by substance_id
				},
				include: [
					{
						model: StoreModel,
						attributes: [],
						required: true,
					},
				],
				attributes: [
					"movment_id",

					[req.db.fn("SUM", req.db.col("amount")), "total_amount"],
				],
				group: ["movment_id"],
				raw: true,
				transaction: t,
			});
			const creditSales = await CreditSaleModel.findAll({
				where: {
					station_id: req.query.station,
					movment_id: {
						[Op.in]: movmentsIds,
					},
					"$store.substance_id$": req.query.substance, // Filter by substance_id
				},
				include: [
					{
						model: StoreModel,
						attributes: [],
						required: true,
					},
				],
				attributes: [
					"movment_id",
					[req.db.fn("SUM", req.db.col("amount")), "total_amount"],
				],
				group: ["movment_id"],
				raw: true,
				transaction: t,
			});
			// const coverdCreditSalesArr = await CreditSaleModel.findAll({
			// 	where: {
			// 		station_id: req.query.station,
			// 		movment_id: {
			// 			[Op.in]: movmentsIds,
			// 		},
			// 		isSettled: 1,
			// 		"$store.substance_id$": req.query.substance, // Filter by substance_id
			// 	},
			// 	include: [
			// 		{
			// 			model: CreditSaleSettlementModel,
			// 			where: {
			// 				date: {
			// 					[Op.between]: [req.query.startDate, req.query.endDate],
			// 				},
			// 				type: {
			// 					[Op.in]: ["خصم كمية", "نقدي"],
			// 				},
			// 			},
			// 			attributes: ["date"],
			// 		},
			// 		{
			// 			model: StoreModel,
			// 			attributes: [],
			// 			required: true,
			// 		},
			// 	],
			// 	raw: true,
			// 	transaction: t,
			// });
			// const groupedCoverdCreditSales = {};

			// for (const record of coverdCreditSalesArr) {
			// 	const movmentId = record.movment_id;

			// 	if (!groupedCoverdCreditSales[movmentId]) {
			// 		groupedCoverdCreditSales[movmentId] = {
			// 			movment_id: movmentId,
			// 			total_amount: 0,
			// 			total_value: 0,
			// 		};
			// 	}

			// 	groupedCoverdCreditSales[movmentId].total_amount += record.amount;
			// 	groupedCoverdCreditSales[movmentId].total_value +=
			// 		record.amount * record.price;
			// }

			// Convert the grouped result object into an array of objects
			// const CoverdCreditSales = Object.values(groupedCoverdCreditSales);

			// const stockTaking = await StocktakingModel.findAll({
			// 	where: {
			// 		station_id: req.query.station,
			// 		movment_id: {
			// 			[Op.in]: movmentsIds,
			// 		},
			// 		substance_id: req.query.substance, // Filter by substance_id
			// 	},

			// 	raw: true,
			// 	transaction: t,
			// });
			const stores_movments = await StoreMovmentModel.findAll({
				where: {
					station_id: req.query.station,
					"$store.substance_id$": req.query.substance, // Filter by substance_id
					movment_id: {
						[Op.in]: movmentsIds,
					},
				},
				include: [
					{
						model: StoreModel,
						attributes: [],
						required: true,
					},
				],
				attributes: [
					"movment_id",
					"shift_id",
					"price",
					[req.db.fn("SUM", req.db.col("prev_value")), "total_prev_value"],
					[req.db.fn("SUM", req.db.col("curr_value")), "total_curr_value"],
				],
				group: ["movment_id", "shift_id", "price"],
				raw: true,
				transaction: t,
			});
			movments.forEach((el) => {
				// let stockTakingValue = 0;
				// stockTaking
				// 	.filter((ele) => ele.movment_id === el.id)
				// 	.forEach((ele) => {
				// 		stockTakingValue =
				// 			stockTakingValue + ele.curr_value - ele.prev_value;
				// 	});
				const startShift = shifts.filter(
					(ele) => ele.movment_id === el.id && ele.number === 1,
				);
				const startMovment = stores_movments.filter(
					(ele) =>
						ele.movment_id === el.id && ele.shift_id === startShift[0].id,
				)[0];
				let endShift = null;
				let endMovment = null;
				let incomesAmount =
					incomes.filter((ele) => ele.movment_id === el.id)[0]?.total_amount ||
					0;
				// let coverdCreditSalesAmount =
				// 	CoverdCreditSales.filter((ele) => ele.movment_id === el.id)[0]
				// 		?.total_amount || 0;
				// let coverdCreditSalesValue =
				// 	CoverdCreditSales.filter((ele) => ele.movment_id === el.id)[0]
				// 		?.total_value || 0;
				let surplusAmount =
					surplus.filter((ele) => ele.movment_id === el.id)[0]?.total_amount ||
					0;
				let calibrationsAmount =
					calibrations.filter((ele) => ele.movment_id === el.id)[0]
						?.total_amount || 0;
				let creditSalesAmount =
					creditSales.filter((ele) => ele.movment_id === el.id)[0]
						?.total_amount || 0;
				let othersAmount =
					others.filter((ele) => ele.movment_id === el.id)[0]?.total_amount ||
					0;
				el.date = el.date.split("T")[0].replace(/-/g, "/");
				if (el.shifts > 1) {
					endShift = shifts.filter(
						(ele) => ele.movment_id === el.id && ele.number === el.shifts,
					);
					endMovment = stores_movments.filter(
						(ele) =>
							ele.movment_id === el.id && ele.shift_id === endShift[0].id,
					)[0];
				}

				el.price = startMovment.price;
				el.prev_value = +startMovment.total_prev_value;
				el.income = +incomesAmount + +surplusAmount + +calibrationsAmount;
				el.others = +othersAmount;
				el.calibrations = +calibrationsAmount;
				el.surplus_amount = +surplusAmount;
				el.creditSalesAmount = +creditSalesAmount;

				el.incomeAndPrevValue = +el.income + +el.prev_value;
				el.totalCreditSalesAmount =
					+el.others + +creditSalesAmount + +el.calibrations;
				el.totalCreditSalesValue = +el.totalCreditSalesAmount * el.price;
				el.othersValue = el.others * el.price;
				el.calibrationsValue = el.calibrations * el.price;

				// el.stockTakingValue = stockTakingValue;
				if (endMovment) {
					el.curr_value = +endMovment.total_curr_value;
					el.final_value = +endMovment.total_curr_value;
				} else {
					el.curr_value = +startMovment.total_curr_value;
					el.final_value = +startMovment.total_curr_value;
				}
				el.cashSalesAmount =
					el.incomeAndPrevValue -
					+el.curr_value -
					el.others -
					+el.calibrations -
					+el.creditSalesAmount;
				// -
				// (stockTakingValue > 0 ? stockTakingValue : 0);
				el.cashSalesValue = el.cashSalesAmount * el.price;
				el.totalSpend = el.incomeAndPrevValue - +el.curr_value;
				// -
				// (stockTakingValue > 0 ? stockTakingValue : 0);
			});
			res.status(200).json({
				info: {
					station_name: station[0].name,
					substance_name: substance.name,
					fromDate: req.query.startDate,
					toDate: req.query.endDate,
				},
				movments,
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getStoresMovmentSummaryInPeriod = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const StationModel = getModel(req.year, "station");
			const SubstanceModel = getModel(req.year, "substance");
			const StoreModel = getModel(req.year, "store");
			const MovmentModel = getModel(req.year, "movment");
			const StoreMovmentModel = getModel(req.year, "store_movment");
			const IncomeModel = getModel(req.year, "income");
			const QuantityDeductionModel = getModel(req.year, "quantity_deduction");
			const SurplusModel = getModel(req.year, "surplus");
			const CalibrationModel = getModel(req.year, "calibration");
			const OtherModel = getModel(req.year, "other");
			const CreditSaleModel = getModel(req.year, "credit_sale");
			// const CreditSaleSettlementModel = getModel(
			// 	req.year,
			// 	"credit_sale_settlement"
			// );

			const movments = await MovmentModel.findAll({
				where: {
					station_id: req.query.station,
					date: {
						[Op.between]: [req.query.startDate, req.query.endDate], // Assuming startDate and endDate are defined
					},
				},
				raw: true,
				transaction: t,
			});
			const movmentsIds = movments.map((el) => el.id);
			const storesIds = req.query.stores.split(",");
			const storesMovments = await StoreMovmentModel.findAll({
				where: {
					movment_id: {
						[Sequelize.Op.in]: movmentsIds,
					},
					store_id: {
						[Sequelize.Op.in]: storesIds,
					},
				},
				raw: true,
				include: [
					{
						model: StoreModel,
						attributes: ["id", "name", "type"],
						include: [
							{
								model: SubstanceModel,
								attributes: ["id", "name"],
							},
						],
					},
				],
				// order: [[{ model: SubstanceModel }, "name", "ASC"]],
				transaction: t,
			});
			const groupedstoresById = storesMovments.reduce((acc, item) => {
				const existingGroup = acc.find(
					(group) => group.store_id === item.store_id,
				);

				if (existingGroup) {
					existingGroup.data.push(item);
				} else {
					acc.push({
						store_id: item.store_id,
						data: [item],
					});
				}

				return acc;
			}, []);

			const incomes = await IncomeModel.findAll({
				where: {
					station_id: req.query.station,
					store_id: {
						[Op.in]: storesIds,
					},
					movment_id: {
						[Op.in]: movmentsIds,
					},
				},
				attributes: [
					"store_id",
					[req.db.fn("SUM", req.db.col("amount")), "total_amount"],
					[req.db.literal("SUM(price * amount)"), "total_value"],
				],
				group: ["store_id"],
				raw: true,
				transaction: t,
			});
			const quantityDeduction = await QuantityDeductionModel.findAll({
				where: {
					station_id: req.query.station,
					is_annual_stocktaking: 0,
					store_id: {
						[Op.in]: storesIds,
					},
					date: {
						[Op.between]: [req.query.startDate, req.query.endDate],
					},
				},
				attributes: [
					"store_id",
					[req.db.fn("SUM", req.db.col("amount")), "total_amount"],
					[req.db.literal("SUM(price * amount)"), "total_value"],
				],
				group: ["store_id"],
				raw: true,
				transaction: t,
			});
			const surplus = await SurplusModel.findAll({
				where: {
					station_id: req.query.station,
					is_annual_stocktaking: 0,
					store_id: {
						[Op.in]: storesIds,
					},
					movment_id: {
						[Op.in]: movmentsIds,
					},
				},
				attributes: [
					"store_id",
					[req.db.fn("SUM", req.db.col("amount")), "total_amount"],
					[req.db.literal("SUM(price * amount)"), "total_value"],
				],
				group: ["store_id"],
				raw: true,
				transaction: t,
			});

			const calibrations = await CalibrationModel.findAll({
				where: {
					station_id: req.query.station,
					store_id: {
						[Op.in]: storesIds,
					},
					movment_id: {
						[Op.in]: movmentsIds,
					},
				},
				attributes: [
					"store_id",
					[req.db.fn("SUM", req.db.col("amount")), "total_amount"],
					[req.db.literal("SUM(price * amount)"), "total_value"],
				],
				group: ["store_id"],
				raw: true,
				transaction: t,
			});
			const others = await OtherModel.findAll({
				where: {
					station_id: req.query.station,
					store_id: {
						[Op.in]: storesIds,
					},
					movment_id: {
						[Op.in]: movmentsIds,
					},
				},
				attributes: [
					"store_id",
					[req.db.fn("SUM", req.db.col("amount")), "total_amount"],
					[req.db.literal("SUM(price * amount)"), "total_value"],
				],
				group: ["store_id"],
				raw: true,
				transaction: t,
			});
			const creditSales = await CreditSaleModel.findAll({
				where: {
					station_id: req.query.station,
					store_id: {
						[Op.in]: storesIds,
					},
					movment_id: {
						[Op.in]: movmentsIds,
					},
				},
				attributes: [
					"store_id",
					[req.db.fn("SUM", req.db.col("amount")), "total_amount"],
					[req.db.literal("SUM(price * amount)"), "total_value"],
				],
				group: ["store_id"],
				raw: true,
				transaction: t,
			});

			// const coverdCreditSalesArr = await CreditSaleModel.findAll({
			// 	where: {
			// 		station_id: req.query.station,
			// 		store_id: {
			// 			[Op.in]: storesIds,
			// 		},
			// 		movment_id: {
			// 			[Op.in]: movmentsIds,
			// 		},
			// 		isSettled: 1,
			// 	},
			// 	include: [
			// 		{
			// 			model: CreditSaleSettlementModel,
			// 			where: {
			// 				date: {
			// 					[Op.between]: [req.query.startDate, req.query.endDate],
			// 				},
			// 				type: {
			// 					[Op.in]: ["خصم كمية", "نقدي"],
			// 				},
			// 			},
			// 			attributes: ["date"],
			// 		},
			// 	],
			// 	raw: true,
			// 	transaction: t,
			// });
			// const groupedCoverdCreditSales = {};

			// for (const record of coverdCreditSalesArr) {
			// 	const storeId = record.store_id;

			// 	if (!groupedCoverdCreditSales[storeId]) {
			// 		groupedCoverdCreditSales[storeId] = {
			// 			store_id: storeId,
			// 			total_amount: 0,
			// 			total_value: 0,
			// 		};
			// 	}

			// 	groupedCoverdCreditSales[storeId].total_amount += record.amount;
			// 	groupedCoverdCreditSales[storeId].total_value +=
			// 		record.amount * record.price;
			// }

			// const CoverdCreditSales = Object.values(groupedCoverdCreditSales);

			groupedstoresById.forEach((el) => {
				let total_cash = 0;
				let incomeAmount =
					incomes.filter((ele) => ele.store_id === el.store_id)[0]
						?.total_amount || 0;
				let quantityDeductionAmount =
					quantityDeduction.filter((ele) => ele.store_id === el.store_id)[0]
						?.total_amount || 0;
				let quantityDeductionValue =
					quantityDeduction.filter((ele) => ele.store_id === el.store_id)[0]
						?.total_value || 0;
				let calibrationAmount =
					calibrations.filter((ele) => ele.store_id === el.store_id)[0]
						?.total_amount || 0;
				let surplusAmount =
					surplus.filter((ele) => ele.store_id === el.store_id)[0]
						?.total_amount || 0;
				let surplusValue =
					surplus.filter((ele) => ele.store_id === el.store_id)[0]
						?.total_value || 0;
				let incomeValue =
					incomes.filter((ele) => ele.store_id === el.store_id)[0]
						?.total_value || 0;
				let calibrationValue =
					calibrations.filter((ele) => ele.store_id === el.store_id)[0]
						?.total_value || 0;
				// let coverdCreditSalesAmount =
				// 	CoverdCreditSales.filter((ele) => ele.store_id === el.store_id)[0]
				// 		?.total_amount || 0;
				// let coverdCreditSalesValue =
				// 	CoverdCreditSales.filter((ele) => ele.store_id === el.store_id)[0]
				// 		?.total_value || 0;
				el.data.forEach((ele) => {
					total_cash =
						total_cash + (+ele.prev_value - +ele.curr_value) * ele.price;
				});

				el.income = +incomeAmount + +surplusAmount;
				el.income_value = +incomeValue + +surplusValue;
				el.quantityDeduction = +quantityDeductionAmount;
				el.quantityDeduction_value = +quantityDeductionValue;
				el.calibration = +calibrationAmount;
				el.calibration_value = +calibrationValue;
				// el.coverd_credit_sales_amount = +coverdCreditSalesAmount;
				// el.coverd_credit_sales_value = +coverdCreditSalesValue;
				el.others =
					others.filter((ele) => ele.store_id === el.store_id)[0]
						?.total_amount || 0;
				el.others_value =
					others.filter((ele) => ele.store_id === el.store_id)[0]
						?.total_value || 0;
				el.branchWithdrawals =
					creditSales.filter((ele) => ele.store_id === el.store_id)[0]
						?.total_amount || 0;
				el.branchWithdrawals_value =
					creditSales.filter((ele) => ele.store_id === el.store_id)[0]
						?.total_value || 0;

				el.total_cash =
					total_cash -
					el.others_value +
					// el.coverd_credit_sales_value +
					+el.income_value -
					el.branchWithdrawals_value;
			});

			const storesMovmentsArr = groupedstoresById.map((group) => {
				const store_id = group.store_id;
				// Extract dates and find min and max dates
				const dates = group.data.map((item) => {
					const date = movments.filter((ele) => ele.id === item.movment_id)[0]
						.date;
					return new Date(date);
				});
				const minDate = new Date(Math.min(...dates));
				const maxDate = new Date(Math.max(...dates));

				// Find the data corresponding to minDate and maxDate
				const minDateData = group.data.find((item) => {
					const date = movments.filter((ele) => ele.id === item.movment_id)[0]
						.date;
					return new Date(date).getTime() === minDate.getTime();
				});

				const maxDateData = group.data.find((item) => {
					const date = movments.filter((ele) => ele.id === item.movment_id)[0]
						.date;
					return new Date(date).getTime() === maxDate.getTime();
				});

				return {
					...maxDateData,
					prev_value: minDateData.prev_value,
					income: +group.income + +group.calibration,
					others: +group.others,
					others_value: +group.others_value,
					branchWithdrawals: +group.branchWithdrawals,
					branchWithdrawals_value: +group.branchWithdrawals_value,
					othersAndbranchWithdrawalsAmount:
						+group.others + +group.branchWithdrawals + +group.calibration,
					// - +group.coverd_credit_sales_amount,
					othersAndbranchWithdrawalsValue:
						+group.others_value +
						+group.branchWithdrawals_value +
						group.calibration_value,
					// - +group.coverd_credit_sales_value,
					incomeAndPrevValue:
						+minDateData.prev_value + +group.income + +group.calibration,
					store: `${group.data[0]["store.name"]} - ${group.data[0]["store.substance.name"]}`,
					cashSalesAmount:
						+minDateData.prev_value +
						+group.income -
						+maxDateData.curr_value -
						+group.others -
						// +group.quantityDeduction -
						+group.branchWithdrawals,
					// + +group.coverd_credit_sales_amount,
					total_cash: group.total_cash,
					totalSpend:
						+minDateData.prev_value +
						+group.income +
						+group.calibration -
						// group.quantityDeduction -
						+maxDateData.curr_value,
					quantityDeduction: +group.quantityDeduction,
					quantityDeduction_value: +group.quantityDeduction_value,
					final_value: +maxDateData.curr_value - +group.quantityDeduction,
				};
			});

			const groupedStores = storesMovmentsArr.reduce((acc, item) => {
				const existingGroup = acc.find(
					(group) => group.substance_id === item["store.substance.id"],
				);

				if (existingGroup) {
					existingGroup.data.push(item);
				} else {
					acc.push({
						title: `خلاصة حركة مخازن ال${item["store.substance.name"]}`,
						substance_id: item["store.substance.id"],
						data: [item],
					});
				}

				return acc;
			}, []);
			const station = await StationModel.findAll({
				where: {
					id: req.query.station,
				},
				raw: true,
				transaction: t,
			});
			res.status(200).json({
				info: {
					station_name: station[0].name,
					fromDate: req.query.startDate,
					toDate: req.query.endDate,
				},
				stores: groupedStores,
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getStoresMovmentSummaryByPriceInPeriod = catchAsync(
	async (req, res, next) => {
		try {
			await req.db.transaction(async (t) => {
				const StationModel = getModel(req.year, "station");
				const SubstanceModel = getModel(req.year, "substance");
				const StoreModel = getModel(req.year, "store");
				const MovmentModel = getModel(req.year, "movment");
				const StoreMovmentModel = getModel(req.year, "store_movment");
				const IncomeModel = getModel(req.year, "income");
				const QuantityDeductionModel = getModel(req.year, "quantity_deduction");
				const SurplusModel = getModel(req.year, "surplus");
				const CalibrationModel = getModel(req.year, "calibration");
				const OtherModel = getModel(req.year, "other");
				const CreditSaleModel = getModel(req.year, "credit_sale");
				const SubstancePriceMovmentModel = getModel(
					req.year,
					"substance_price_movment",
				);

				const movments = await MovmentModel.findAll({
					where: {
						station_id: req.query.station,
						date: {
							[Op.between]: [req.query.startDate, req.query.endDate],
						},
					},
					raw: true,
					transaction: t,
				});
				const movmentsIds = movments.map((el) => el.id);
				const storesIds = req.query.stores.split(",");
				const storesMovments = await StoreMovmentModel.findAll({
					where: {
						movment_id: {
							[Sequelize.Op.in]: movmentsIds,
						},
						store_id: {
							[Sequelize.Op.in]: storesIds,
						},
					},
					raw: true,
					include: [
						{
							model: StoreModel,
							attributes: ["id", "name", "type"],
							include: [
								{
									model: SubstanceModel,
									attributes: ["id", "name"],
								},
							],
						},
					],
					transaction: t,
				});

				// Get all price movements that overlap with the selected period
				const priceMovments = await SubstancePriceMovmentModel.findAll({
					where: {
						[Op.or]: [
							{
								start_date: {
									[Op.between]: [req.query.startDate, req.query.endDate],
								},
							},
							{
								end_date: {
									[Op.between]: [req.query.startDate, req.query.endDate],
								},
							},
							{
								[Op.and]: [
									{
										start_date: {
											[Op.lte]: req.query.startDate,
										},
									},
									{
										[Op.or]: [
											{ end_date: { [Op.gte]: req.query.endDate } },
											{ end_date: null },
										],
									},
								],
							},
						],
					},
					order: [["start_date", "ASC"]],
					raw: true,
					transaction: t,
				});

				const groupedstoresById = storesMovments.reduce((acc, item) => {
					const existingGroup = acc.find(
						(group) => group.store_id === item.store_id,
					);

					if (existingGroup) {
						existingGroup.data.push(item);
					} else {
						acc.push({
							store_id: item.store_id,
							data: [item],
						});
					}

					return acc;
				}, []);

				const incomes = await IncomeModel.findAll({
					where: {
						station_id: req.query.station,
						store_id: {
							[Op.in]: storesIds,
						},
						movment_id: {
							[Op.in]: movmentsIds,
						},
					},
					attributes: ["store_id", "movment_id", "price", "amount"],
					raw: true,
					transaction: t,
				});
				const quantityDeduction = await QuantityDeductionModel.findAll({
					where: {
						station_id: req.query.station,
						is_annual_stocktaking: 0,
						store_id: {
							[Op.in]: storesIds,
						},
						date: {
							[Op.between]: [req.query.startDate, req.query.endDate],
						},
					},
					attributes: ["store_id", "date", "price", "amount"],
					raw: true,
					transaction: t,
				});
				const surplus = await SurplusModel.findAll({
					where: {
						station_id: req.query.station,
						is_annual_stocktaking: 0,
						store_id: {
							[Op.in]: storesIds,
						},
						movment_id: {
							[Op.in]: movmentsIds,
						},
					},
					attributes: ["store_id", "movment_id", "price", "amount"],
					raw: true,
					transaction: t,
				});

				const calibrations = await CalibrationModel.findAll({
					where: {
						station_id: req.query.station,
						store_id: {
							[Op.in]: storesIds,
						},
						movment_id: {
							[Op.in]: movmentsIds,
						},
					},
					attributes: ["store_id", "movment_id", "price", "amount"],
					raw: true,
					transaction: t,
				});
				const others = await OtherModel.findAll({
					where: {
						station_id: req.query.station,
						store_id: {
							[Op.in]: storesIds,
						},
						movment_id: {
							[Op.in]: movmentsIds,
						},
					},
					attributes: ["store_id", "movment_id", "price", "amount"],
					raw: true,
					transaction: t,
				});
				const creditSales = await CreditSaleModel.findAll({
					where: {
						station_id: req.query.station,
						store_id: {
							[Op.in]: storesIds,
						},
						movment_id: {
							[Op.in]: movmentsIds,
						},
					},
					attributes: ["store_id", "movment_id", "price", "amount"],
					raw: true,
					transaction: t,
				});

				groupedstoresById.forEach((el) => {
					let total_cash = 0;
					let incomeAmount = incomes
						.filter((ele) => ele.store_id === el.store_id)
						.reduce((sum, ele) => sum + (+ele.amount || 0), 0);
					let quantityDeductionAmount = quantityDeduction
						.filter((ele) => ele.store_id === el.store_id)
						.reduce((sum, ele) => sum + (+ele.amount || 0), 0);
					let quantityDeductionValue = quantityDeduction
						.filter((ele) => ele.store_id === el.store_id)
						.reduce((sum, ele) => sum + (+ele.price * +ele.amount || 0), 0);
					let calibrationAmount = calibrations
						.filter((ele) => ele.store_id === el.store_id)
						.reduce((sum, ele) => sum + (+ele.amount || 0), 0);
					let surplusAmount = surplus
						.filter((ele) => ele.store_id === el.store_id)
						.reduce((sum, ele) => sum + (+ele.amount || 0), 0);
					let surplusValue = surplus
						.filter((ele) => ele.store_id === el.store_id)
						.reduce((sum, ele) => sum + (+ele.price * +ele.amount || 0), 0);
					let incomeValue = incomes
						.filter((ele) => ele.store_id === el.store_id)
						.reduce((sum, ele) => sum + (+ele.price * +ele.amount || 0), 0);
					let calibrationValue = calibrations
						.filter((ele) => ele.store_id === el.store_id)
						.reduce((sum, ele) => sum + (+ele.price * +ele.amount || 0), 0);
					el.data.forEach((ele) => {
						total_cash =
							total_cash + (+ele.prev_value - +ele.curr_value) * ele.price;
					});

					el.income = +incomeAmount + +surplusAmount;
					el.income_value = +incomeValue + +surplusValue;
					el.quantityDeduction = +quantityDeductionAmount;
					el.quantityDeduction_value = +quantityDeductionValue;
					el.calibration = +calibrationAmount;
					el.calibration_value = +calibrationValue;
					el.others = others
						.filter((ele) => ele.store_id === el.store_id)
						.reduce((sum, ele) => sum + (+ele.amount || 0), 0);
					el.others_value = others
						.filter((ele) => ele.store_id === el.store_id)
						.reduce((sum, ele) => sum + (+ele.price * +ele.amount || 0), 0);
					el.branchWithdrawals = creditSales
						.filter((ele) => ele.store_id === el.store_id)
						.reduce((sum, ele) => sum + (+ele.amount || 0), 0);
					el.branchWithdrawals_value = creditSales
						.filter((ele) => ele.store_id === el.store_id)
						.reduce((sum, ele) => sum + (+ele.price * +ele.amount || 0), 0);

					el.total_cash =
						total_cash -
						el.others_value +
						+el.income_value -
						el.branchWithdrawals_value;
				});

				const storesMovmentsArr = groupedstoresById.map((group) => {
					const store_id = group.store_id;
					const dates = group.data.map((item) => {
						const date = movments.filter((ele) => ele.id === item.movment_id)[0]
							.date;
						return new Date(date);
					});
					const minDate = new Date(Math.min(...dates));
					const maxDate = new Date(Math.max(...dates));

					const minDateData = group.data.find((item) => {
						const date = movments.filter((ele) => ele.id === item.movment_id)[0]
							.date;
						return new Date(date).getTime() === minDate.getTime();
					});

					const maxDateData = group.data.find((item) => {
						const date = movments.filter((ele) => ele.id === item.movment_id)[0]
							.date;
						return new Date(date).getTime() === maxDate.getTime();
					});

					// Group by price for this store
					const substanceId = group.data[0]["store.substance.id"];
					const relevantPriceMovments = priceMovments.filter(
						(pm) => pm.substance_id === substanceId,
					);

					const priceGroups = relevantPriceMovments.map((pricePeriod) => {
						const periodStart =
							pricePeriod.start_date > req.query.startDate
								? pricePeriod.start_date
								: req.query.startDate;
						const periodEnd = pricePeriod.end_date
							? pricePeriod.end_date < req.query.endDate
								? pricePeriod.end_date
								: req.query.endDate
							: req.query.endDate;

						// Filter data for this price period
						const periodMovmentsIds = movments
							.filter((m) => m.date >= periodStart && m.date <= periodEnd)
							.map((m) => m.id);

						const periodData = group.data.filter((item) =>
							periodMovmentsIds.includes(item.movment_id),
						);

						if (periodData.length === 0) return null;

						const periodDates = periodData.map((item) => {
							const date = movments.filter(
								(ele) => ele.id === item.movment_id,
							)[0].date;
							return new Date(date);
						});
						const periodMinDate = new Date(Math.min(...periodDates));
						const periodMaxDate = new Date(Math.max(...periodDates));

						const periodMinDateData = periodData.find((item) => {
							const date = movments.filter(
								(ele) => ele.id === item.movment_id,
							)[0].date;
							return new Date(date).getTime() === periodMinDate.getTime();
						});

						const periodMaxDateData = periodData.find((item) => {
							const date = movments.filter(
								(ele) => ele.id === item.movment_id,
							)[0].date;
							return new Date(date).getTime() === periodMaxDate.getTime();
						});

						// Calculate totals for this price period - filter by movment_id
						const periodIncomes = incomes.filter(
							(inc) =>
								inc.store_id === store_id &&
								periodMovmentsIds.includes(inc.movment_id),
						);
						const periodSurplus = surplus.filter(
							(s) =>
								s.store_id === store_id &&
								periodMovmentsIds.includes(s.movment_id),
						);
						const periodCalibrations = calibrations.filter(
							(c) =>
								c.store_id === store_id &&
								periodMovmentsIds.includes(c.movment_id),
						);
						const periodOthers = others.filter(
							(o) =>
								o.store_id === store_id &&
								periodMovmentsIds.includes(o.movment_id),
						);
						const periodCreditSales = creditSales.filter(
							(cs) =>
								cs.store_id === store_id &&
								periodMovmentsIds.includes(cs.movment_id),
						);
						// For quantityDeduction, filter by date instead of movment_id
						const periodQuantityDeduction = quantityDeduction.filter(
							(qd) =>
								qd.store_id === store_id &&
								qd.date >= periodStart &&
								qd.date <= periodEnd,
						);

						const pIncomeAmount = periodIncomes.reduce(
							(sum, ele) => sum + (+ele.amount || 0),
							0,
						);
						const pIncomeValue = periodIncomes.reduce(
							(sum, ele) => sum + (+ele.price * +ele.amount || 0),
							0,
						);
						const pSurplusAmount = periodSurplus.reduce(
							(sum, ele) => sum + (+ele.amount || 0),
							0,
						);
						const pSurplusValue = periodSurplus.reduce(
							(sum, ele) => sum + (+ele.price * +ele.amount || 0),
							0,
						);
						const pCalibrationAmount = periodCalibrations.reduce(
							(sum, ele) => sum + (+ele.amount || 0),
							0,
						);
						const pCalibrationValue = periodCalibrations.reduce(
							(sum, ele) => sum + (+ele.price * +ele.amount || 0),
							0,
						);
						const pOthersAmount = periodOthers.reduce(
							(sum, ele) => sum + (+ele.amount || 0),
							0,
						);
						const pOthersValue = periodOthers.reduce(
							(sum, ele) => sum + (+ele.price * +ele.amount || 0),
							0,
						);
						const pCreditSalesAmount = periodCreditSales.reduce(
							(sum, ele) => sum + (+ele.amount || 0),
							0,
						);
						const pCreditSalesValue = periodCreditSales.reduce(
							(sum, ele) => sum + (+ele.price * +ele.amount || 0),
							0,
						);
						const pQuantityDeductionAmount = periodQuantityDeduction.reduce(
							(sum, ele) => sum + (+ele.amount || 0),
							0,
						);

						let pTotalCash = 0;
						periodData.forEach((ele) => {
							pTotalCash =
								pTotalCash + (+ele.prev_value - +ele.curr_value) * ele.price;
						});

						return {
							price_period_id: pricePeriod.id,
							price_period_name: pricePeriod.name,
							price: pricePeriod.price,
							prev_price: pricePeriod.prev_price,
							start_date: periodStart,
							end_date: periodEnd,
							prev_value: periodMinDateData.prev_value,
							curr_value: periodMaxDateData.curr_value,
							income: +pIncomeAmount + +pSurplusAmount + +pCalibrationAmount,
							income_value: +pIncomeValue + +pSurplusValue + +pCalibrationValue,
							others: +pOthersAmount,
							others_value: +pOthersValue,
							branchWithdrawals: +pCreditSalesAmount,
							branchWithdrawals_value: +pCreditSalesValue,
							othersAndbranchWithdrawalsAmount:
								+pOthersAmount + +pCreditSalesAmount + +pCalibrationAmount,
							othersAndbranchWithdrawalsValue:
								+pOthersValue + +pCreditSalesValue + +pCalibrationValue,
							incomeAndPrevValue:
								+periodMinDateData.prev_value +
								+pIncomeAmount +
								+pSurplusAmount +
								+pCalibrationAmount,
							cashSalesAmount:
								+periodMinDateData.prev_value +
								+pIncomeAmount +
								+pSurplusAmount -
								+periodMaxDateData.curr_value -
								+pOthersAmount -
								+pQuantityDeductionAmount -
								+pCreditSalesAmount,
							total_cash:
								pTotalCash -
								pOthersValue +
								pIncomeValue +
								pSurplusValue -
								pCreditSalesValue,
							totalSpend:
								+periodMinDateData.prev_value +
								+pIncomeAmount +
								+pSurplusAmount +
								+pCalibrationAmount -
								pQuantityDeductionAmount -
								+periodMaxDateData.curr_value,
							final_value: +periodMaxDateData.curr_value,
						};
					});

					return {
						...maxDateData,
						prev_value: minDateData.prev_value,
						income: +group.income + +group.calibration,
						others: +group.others,
						others_value: +group.others_value,
						branchWithdrawals: +group.branchWithdrawals,
						branchWithdrawals_value: +group.branchWithdrawals_value,
						othersAndbranchWithdrawalsAmount:
							+group.others + +group.branchWithdrawals + +group.calibration,
						othersAndbranchWithdrawalsValue:
							+group.others_value +
							+group.branchWithdrawals_value +
							group.calibration_value,
						incomeAndPrevValue:
							+minDateData.prev_value + +group.income + +group.calibration,
						store: `${group.data[0]["store.name"]} - ${group.data[0]["store.substance.name"]}`,
						cashSalesAmount:
							+minDateData.prev_value +
							+group.income -
							+maxDateData.curr_value -
							+group.others -
							+group.quantityDeduction -
							+group.branchWithdrawals,
						total_cash: group.total_cash,
						totalSpend:
							+minDateData.prev_value +
							+group.income +
							+group.calibration -
							group.quantityDeduction -
							+maxDateData.curr_value,
						final_value: +maxDateData.curr_value,
						priceGroups: priceGroups.filter((pg) => pg !== null),
					};
				});

				const station = await StationModel.findAll({
					where: {
						id: req.query.station,
					},
					raw: true,
					transaction: t,
				});
				res.status(200).json({
					info: {
						station_name: station[0].name,
						fromDate: req.query.startDate,
						toDate: req.query.endDate,
					},
					stores: storesMovmentsArr,
				});
			});
		} catch (error) {
			return next(new AppError(error, 500));
		}
	},
);

exports.getDispensersMovmentInPeriod = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const MovmentModel = getModel(req.year, "movment");
			const StationModel = getModel(req.year, "station");
			const SubstanceModel = getModel(req.year, "substance");
			const TankModel = getModel(req.year, "tank");
			const DispenserModel = getModel(req.year, "dispenser");
			const MovmentsShiftsModel = getModel(req.year, "movments_shift");
			const DispenserMovmentModel = getModel(req.year, "dispenser_movment");
			const movments = await MovmentModel.findAll({
				where: {
					station_id: req.query.station,
					date: {
						[Op.between]: [req.query.startDate, req.query.endDate], // Assuming startDate and endDate are defined
					},
				},
				raw: true,
				transaction: t,
			});
			const movmentsIds = movments.map((el) => el.id);
			const shifts = await MovmentsShiftsModel.findAll({
				where: {
					movment_id: {
						[Op.in]: movmentsIds,
					},
					number: 1,
				},
				raw: true,
				transaction: t,
			});
			const shiftsIds = shifts.map((el) => el.id);
			const DispensersMovments = await DispenserMovmentModel.findAll({
				where: {
					movment_id: {
						[Sequelize.Op.in]: movmentsIds,
					},
					shift_id: {
						[Op.in]: shiftsIds,
					},
					is_active: 1,
				},
				raw: true,
				include: [
					{
						model: DispenserModel,
						attributes: ["id", "number"],
						include: [
							{
								model: TankModel,
								attributes: ["id"],
								include: [
									{
										model: SubstanceModel,
										attributes: ["id", "name"],
									},
								],
							},
						],
					},
				],
				order: [[{ model: DispenserModel }, "number", "ASC"]],
				transaction: t,
			});

			const groupedDispensersById = DispensersMovments.reduce((acc, item) => {
				const existingGroup = acc.find(
					(group) => group.dispenser_id === item.dispenser_id,
				);

				if (existingGroup) {
					existingGroup.data.push(item);
				} else {
					acc.push({
						dispenser_id: item.dispenser_id,
						data: [item],
					});
				}

				return acc;
			}, []);
			const dispensersMovments = groupedDispensersById.map((group) => {
				const dispenser_id = group.dispenser_id;

				// Extract dates and find min and max dates
				const dates = group.data.map((item) => {
					const date = movments.filter((ele) => ele.id === item.movment_id)[0]
						.date;
					return new Date(date);
				});
				const minDate = new Date(Math.min(...dates));
				const maxDate = new Date(Math.max(...dates));

				// Find the data corresponding to minDate and maxDate
				const minDateData = group.data.find((item) => {
					const date = movments.filter((ele) => ele.id === item.movment_id)[0]
						.date;
					return new Date(date).getTime() === minDate.getTime();
				});

				const maxDateData = group.data.find((item) => {
					const date = movments.filter((ele) => ele.id === item.movment_id)[0]
						.date;
					return new Date(date).getTime() === maxDate.getTime();
				});

				return {
					...maxDateData,
					prev_A: minDateData.prev_A,
					prev_B: minDateData.prev_B,
					total:
						maxDateData.curr_A -
						minDateData.prev_A +
						maxDateData.curr_B -
						minDateData.prev_B,
				};
			});
			const groupedDispensers = dispensersMovments.reduce((acc, item) => {
				const existingGroup = acc.find(
					(group) => group.substance_id === item["dispenser.tank.substance.id"],
				);

				if (existingGroup) {
					existingGroup.data.push(item);
				} else {
					acc.push({
						title: `حركة عدادات ال${item["dispenser.tank.substance.name"]}`,
						substance_id: item["dispenser.tank.substance.id"],
						data: [item],
					});
				}

				return acc;
			}, []);
			const station = await StationModel.findAll({
				where: {
					id: req.query.station,
				},
				raw: true,
				transaction: t,
			});

			res.status(200).json({
				info: {
					station_name: station[0].name,
					fromDate: req.query.startDate,
					toDate: req.query.endDate,
				},
				dispensers: groupedDispensers,
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getDepositsMovmentInPeriod = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const DepositModel = getModel(req.year, "deposit");
			const BankModel = getModel(req.year, "bank");
			const StationModel = getModel(req.year, "station");

			let deposits;
			if (req.query.type === "اشعار الايداع") {
				deposits = await DepositModel.findAll({
					where: {
						station_id: req.query.station,
						invoice_date: {
							[Op.between]: [req.query.startDate, req.query.endDate],
						},
					},
					include: [
						{
							model: BankModel,
							attributes: ["name"],
						},
					],
					raw: true,
					transaction: t,
				});
			} else if (req.query.type === "الحركة") {
				deposits = await DepositModel.findAll({
					where: {
						station_id: req.query.station,
						date: {
							[Op.between]: [req.query.startDate, req.query.endDate],
						},
					},
					include: [
						{
							model: BankModel,
							attributes: ["name"],
						},
					],
					raw: true,
					transaction: t,
				});
			}
			deposits.forEach((el) => {
				el.invoice_date = el.invoice_date.split("T")[0].replace(/-/g, "/");
				el.date = el.date.split("T")[0].replace(/-/g, "/");
			});
			const station = await StationModel.findAll({
				where: {
					id: req.query.station,
				},
				raw: true,
				transaction: t,
			});
			res.status(200).json({
				info: {
					station_name: station[0].name,
					fromDate: req.query.startDate,
					toDate: req.query.endDate,
					type: req.query.type,
				},
				deposits,
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getIncomesMovmentInPeriod = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const MovmentModel = getModel(req.year, "movment");
			const IncomeModel = getModel(req.year, "income");
			const CalibrationModel = getModel(req.year, "calibration");
			const SurplusModel = getModel(req.year, "surplus");
			const StoreModel = getModel(req.year, "store");
			const SubstanceModel = getModel(req.year, "substance");
			const StationModel = getModel(req.year, "station");

			const storesIds = req.query.stores.split(",").map(Number);

			const movments = await MovmentModel.findAll({
				where: {
					station_id: req.query.station,
					date: {
						[Op.between]: [req.query.startDate, req.query.endDate],
					},
					state: "approved",
				},
				raw: true,
				transaction: t,
			});
			const movmentsIds = movments.map((el) => el.id);

			const incomes = await IncomeModel.findAll({
				where: {
					movment_id: {
						[Op.in]: movmentsIds,
					},
					store_id: {
						[Op.in]: storesIds,
					},
				},
				include: [
					{
						model: StoreModel,
						attributes: ["name"],
						include: [{ model: SubstanceModel, attributes: ["name"] }],
					},
					{
						model: MovmentModel,
						attributes: ["date"],
					},
				],
				raw: true,
				transaction: t,
			});
			const calibrations = await CalibrationModel.findAll({
				where: {
					movment_id: {
						[Op.in]: movmentsIds,
					},
					store_id: {
						[Op.in]: storesIds,
					},
				},
				include: [
					{
						model: StoreModel,
						attributes: ["name"],
						include: [{ model: SubstanceModel, attributes: ["name"] }],
					},
					{
						model: MovmentModel,
						attributes: ["date"],
					},
				],
				raw: true,
				transaction: t,
			});
			const surpluses = await SurplusModel.findAll({
				where: {
					movment_id: {
						[Op.in]: movmentsIds,
					},
					is_annual_stocktaking: 0,
					store_id: {
						[Op.in]: storesIds,
					},
				},
				include: [
					{
						model: StoreModel,
						attributes: ["name"],
						include: [{ model: SubstanceModel, attributes: ["name"] }],
					},
					{
						model: MovmentModel,
						attributes: ["date"],
					},
				],
				raw: true,
				transaction: t,
			});
			incomes.forEach((el) => {
				if (el.type === "income") {
					el.type = "وارد";
				}
				if (el.type === "initial") {
					el.type = "رصيد افتتاحي";
				}
				el["movment.date"] = el["movment.date"]
					.split("T")[0]
					.replace(/-/g, "/");
			});
			surpluses.forEach((el) => {
				el.type = "فائض";
			});
			calibrations.forEach((el) => {
				el.type = "معايرة";
			});
			const joinedArray = incomes.concat(calibrations, surpluses);
			const groupedData = joinedArray.reduce((acc, item) => {
				const storeId = item.store_id;
				const storeName = item["store.name"];
				const substanceName = item["store.substance.name"];

				if (!acc[storeId]) {
					// Create a new group if it doesn't exist
					acc[storeId] = {
						store_name: storeName,
						store_id: storeId,
						substance_name: substanceName,
						data: [],
					};
				}

				// Push the item into the respective store's data array
				acc[storeId].data.push(item);

				return acc;
			}, {});
			const result = Object.values(groupedData);
			// Convert the object to an array of groups
			const totalAmountsArray = Object.entries(
				joinedArray.reduce((acc, item) => {
					const substanceId = item["store.substance.id"];
					const substanceName = item["store.substance.name"];

					if (acc[substanceId]) {
						acc[substanceId].total += item.amount;
					} else {
						acc[substanceId] = {
							substance_id: substanceId,
							substance_name: substanceName,
							total: item.amount,
						};
					}
					return acc;
				}, {}),
			).map(([substance_id, { substance_name, total }]) => ({
				substance_id: parseInt(substance_id),
				substance_name,
				total,
			}));
			const station = await StationModel.findAll({
				where: {
					id: req.query.station,
				},
				raw: true,
				transaction: t,
			});
			res.status(200).json({
				info: {
					station_name: station[0].name,
					fromDate: req.query.startDate,
					toDate: req.query.endDate,
				},
				result,
				totalAmountsArray,
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getMovmentReport = catchAsync(async (req, res, next) => {
	try {
		let dispensersMovment = [];
		let storesMovment = [];
		await req.db.transaction(async (t) => {
			const MovmentModel = getModel(req.year, "movment");
			const DispenserModel = getModel(req.year, "dispenser");

			const SubstanceModel = getModel(req.year, "substance");
			const TankModel = getModel(req.year, "tank");
			const DispenserMovmentModel = getModel(req.year, "dispenser_movment");
			const StoreModel = getModel(req.year, "store");
			const StoreMovmentModel = getModel(req.year, "store_movment");

			const movment = await MovmentModel.findOne({
				where: {
					id: req.params.id,
				},
				transaction: t,
			});

			//find 1st data
			const dispensersMovments1 = await DispenserMovmentModel.findAll({
				where: {
					movment_id: req.params.id,
					shift_number: 1,
					is_active: 1,
				},
				include: [
					{
						model: DispenserModel,
						attributes: ["id", "number"],
						include: [
							{
								model: TankModel,
								attributes: ["id"],
								include: [
									{
										model: SubstanceModel,
										attributes: ["id", "name"],
									},
								],
							},
						],
					},
				],

				transaction: t,
			});
			const storesMovments1 = await StoreMovmentModel.findAll({
				where: {
					movment_id: req.params.id,
					shift_number: 1,
				},
				include: [
					{
						model: StoreModel,
						attributes: ["name", "type"],
						include: [
							{
								model: SubstanceModel,
								attributes: ["id", "name"],
							},
						],
					},
				],
				transaction: t,
			});
			//find last data
			if (movment.shifts > 1) {
				const dispensersMovments2 = await DispenserMovmentModel.findAll({
					where: {
						movment_id: req.params.id,
						shift_number: movment.shifts,
						is_active: 1,
					},
					raw: true,
					transaction: t,
				});
				const storesMovments2 = await StoreMovmentModel.findAll({
					where: {
						movment_id: req.params.id,
						shift_number: movment.shifts,
					},
					raw: true,
					transaction: t,
				});
				dispensersMovment = dispensersMovments2.map((el) => {
					const data = dispensersMovments1.filter(
						(ele) => ele.dispenser_id === el.dispenser_id,
					)[0];
					return {
						id: el.id,
						prev_A: data.prev_A,
						curr_A: el.curr_A,
						prev_B: data.prev_B,
						curr_B: el.curr_B,
						substance: data.dispenser.tank.substance.name,
						substance_id: data.dispenser.tank.substance.id,
						number: data.dispenser.number,
					};
				});
				storesMovment = storesMovments2.map((el) => {
					const data = storesMovments1.filter(
						(ele) => ele.store_id === el.store_id,
					)[0];

					return {
						id: el.id,
						store_id: el.store_id,
						prev_value: data.prev_value,
						curr_value: el.curr_value,
						name: data.store.name,
						substance: data.store.substance.name,
						substance_id: data.store.substance.id,
						type: data.store.type,
						price: data.price,
					};
				});
			} else {
				storesMovment = storesMovments1.map((el) => {
					return {
						id: el.id,
						store_id: el.store_id,
						prev_value: el.prev_value,
						curr_value: el.curr_value,
						name: el.store.name,
						substance: el.store.substance.name,
						substance_id: el.store.substance.id,
						type: el.store.type,
						price: el.price,
					};
				});
				dispensersMovment = dispensersMovments1.map((el) => {
					return {
						id: el.id,
						prev_A: el.prev_A,
						curr_A: el.curr_A,
						prev_B: el.prev_B,
						curr_B: el.curr_B,
						substance: el.dispenser.tank.substance.name,
						substance_id: el.dispenser.tank.substance.id,
						number: el.dispenser.number,
					};
				});
			}
			const incomes = await IncomeModel.findAll({
				where: {
					movment_id: req.params.id,
				},
				include: [
					{
						model: StoreModel,
						attributes: ["name"],
						include: [
							{
								model: SubstanceModel,
								attributes: ["name"],
							},
						],
					},
				],
				transaction: t,
			});

			const calibrations = await calibrationModel.findAll({
				where: {
					movment_id: req.params.id,
				},
				include: [
					{
						model: StoreModel,
						attributes: ["name"],
						include: [
							{
								model: SubstanceModel,
								attributes: ["name"],
							},
						],
					},
				],
				transaction: t,
			});
			const surplus = await SurplusModel.findAll({
				where: {
					movment_id: req.params.id,
					is_annual_stocktaking: 0,
				},
				include: [
					{
						model: StoreModel,
						attributes: ["name"],
						include: [
							{
								model: SubstanceModel,
								attributes: ["name"],
							},
						],
					},
				],
				transaction: t,
			});
			const others = await OtherModel.findAll({
				where: {
					movment_id: req.params.id,
				},
				include: [
					{
						model: StoreModel,
						attributes: ["name"],
						include: [
							{
								model: SubstanceModel,
								attributes: ["name"],
							},
						],
					},
				],
				transaction: t,
			});
			const coupons = await BranchWithdrawalsModel.findAll({
				where: {
					movment_id: req.params.id,
				},
				include: [
					{
						model: StoreModel,
						attributes: ["name"],
						include: [
							{
								model: SubstanceModel,
								attributes: ["name"],
							},
						],
					},
				],
				transaction: t,
			});
			res.status(200).json({
				state: "success",
				storesMovment,
				dispensersMovment,
				incomes,
				others,
				surplus,
				calibrations,
				coupons,
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getCalibrationReport = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const CalibrationReportModel = getModel(req.year, "calibration_report");
			const calibrationModel = getModel(req.year, "calibration");
			const calibrationMemberModel = getModel(req.year, "calibration_member");
			const StationModel = getModel(req.year, "station");
			const MovmentModel = getModel(req.year, "movment");
			const StoreModel = getModel(req.year, "store");
			const SubstanceModel = getModel(req.year, "substance");
			const DispenserModel = getModel(req.year, "dispenser");

			const calibrationReport = await CalibrationReportModel.findOne({
				where: {
					id: req.params.id,
				},
				include: [
					{
						model: StationModel,
						attributes: ["name", "supervisor"],
					},
					{
						model: MovmentModel,
						attributes: ["date"],
					},
				],
				transaction: t,
				// raw: true,
			});
			const calibrations = await calibrationModel.findAll({
				where: {
					calibration_report_id: req.params.id,
				},
				include: [
					{
						model: StoreModel,
						attributes: ["name"],
						include: [
							{
								model: SubstanceModel,
								attributes: ["name"],
							},
						],
					},
					{
						model: DispenserModel,
						attributes: ["number"],
					},
				],
				transaction: t,
				raw: true,
			});
			const members = await calibrationMemberModel.findAll({
				where: {
					calibration_report_id: req.params.id,
				},
				transaction: t,
				raw: true,
			});

			calibrations.forEach((el) => {
				el.dispenser_name = `${el["dispenser.number"]}-${el["store.substance.name"]}`;
			});
			const groupedById = calibrations.reduce((acc, item) => {
				const existingGroup = acc.find(
					(group) => group.substance_id === item["store.substance.id"],
				);

				if (existingGroup) {
					existingGroup.data.push(item);
				} else {
					acc.push({
						substance_id: item["store.substance.id"],
						title: `عدادات ال${item["store.substance.name"]}`,
						data: [item],
					});
				}

				return acc;
			}, []);
			res.status(200).json({
				state: "success",
				data: {
					calibrations: groupedById,
					members,
					info: {
						station_name: calibrationReport.station.name,
						supervisor: calibrationReport.station.supervisor,
						date: calibrationReport.movment.date,
						number: calibrationReport.id,
					},
				},
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getEmployeeAccountStatementReport = catchAsync(
	async (req, res, next) => {
		try {
			await req.db.transaction(async (t) => {
				const MovmentModel = getModel(req.year, "movment");
				const DispenserModel = getModel(req.year, "dispenser");
				const DispenserMovmentModel = getModel(req.year, "dispenser_movment");
				const TankModel = getModel(req.year, "tank");
				const SubstanceModel = getModel(req.year, "substance");
				const StoreModel = getModel(req.year, "store");
				const OtherModel = getModel(req.year, "other");
				const StationModel = getModel(req.year, "station");
				const ReceivesModel = getModel(req.year, "receive");
				const BranchWithdrawalsModel = getModel(req.year, "branch_withdrawals");
				const EmployeesModel = getModel(req.year, "employee");
				const startDate = new Date(req.query.startDate);
				const previousDay = new Date(startDate);
				previousDay.setDate(startDate.getDate() - 1);
				const movments = await MovmentModel.findAll({
					where: {
						station_id: req.query.station,
						date: {
							[Op.between]: [req.query.startDate, req.query.endDate], // Assuming startDate and endDate are defined
						},
					},
					raw: true,
					transaction: t,
				});

				const prevMovments = await MovmentModel.findAll({
					where: {
						station_id: req.query.station,
						date: {
							[Op.lt]: startDate, // This filters for dates less than the current date
						},
					},
					raw: true,
					transaction: t,
				});

				const movmentsIds = movments.map((el) => el.id);
				const prevMovmentsIds = prevMovments.map((el) => el.id);
				const dispensersCash = await DispenserMovmentModel.findAll({
					where: {
						employee_id: +req.query.employee,
						movment_id: {
							[Op.in]: movmentsIds,
						},
					},
					include: [
						{
							model: MovmentModel,
							attributes: ["date"],
						},
						{
							model: DispenserModel,
							attributes: ["number"],

							include: [
								{
									model: TankModel,
									attributes: ["number"],
									include: [
										{
											model: SubstanceModel,
											attributes: ["name"],
										},
									],
								},
							],
						},
					],
					attributes: {
						include: [
							[
								req.db.literal("(curr_A - prev_A + curr_B - prev_B) * price"),
								"cash",
							],
							[req.db.literal("curr_A - prev_A + curr_B - prev_B"), "amount"],
						],
					},

					transaction: t,
					raw: true,
				});
				dispensersCash.forEach((el) => {
					el.statement = `قيمة مبيعات ${el.amount} لتر ${el["dispenser.tank.substance.name"]} بسعر ${el.price} ريال`;
					el.date = el["movment.date"];
					el.debtor = el.cash;
					el.creditor = 0;
					el.id = el.movment_id;
				});
				const prevDispensersCash = await DispenserMovmentModel.findAll({
					where: {
						employee_id: +req.query.employee,
						movment_id: {
							[Op.in]: prevMovmentsIds,
						},
					},
					attributes: [
						[
							req.db.literal(
								"SUM((curr_A - prev_A + curr_B - prev_B) * price)",
							),
							"cash",
						],
					],
					group: ["station_id"],
					transaction: t,
					raw: true,
				});
				const othersCash = await OtherModel.findAll({
					where: {
						employee_id: +req.query.employee,
						movment_id: {
							[Op.in]: movmentsIds,
						},
					},
					attributes: {
						include: [[req.db.literal("amount * price"), "cash"]],
					},
					include: [
						{
							model: MovmentModel,
							attributes: ["date"],
						},
						{
							model: StoreModel,
							attributes: ["name"],
							include: [
								{
									model: SubstanceModel,
									attributes: ["name"],
								},
							],
						},
					],
					transaction: t,
					raw: true,
				});
				othersCash.forEach((el) => {
					el.statement = `قيمة ${el.amount} لتر ${el["store.substance.name"]} مسحوبات مجنبة من مستودع ${el["store.name"]}`;
					el.date = el["movment.date"];
					el.creditor = el.cash;
					el.debtor = 0;
				});
				const prevOthersCash = await OtherModel.findAll({
					where: {
						employee_id: +req.query.employee,
						movment_id: {
							[Op.in]: prevMovmentsIds,
						},
					},
					attributes: [
						[req.db.literal("SUM(amount * price)"), "cash"], // This sums the amount * price
					],
					group: ["station_id"],
					transaction: t,
					raw: true,
				});

				const branchWithdrawalsCash = await BranchWithdrawalsModel.findAll({
					where: {
						employee_id: +req.query.employee,
						movment_id: {
							[Op.in]: movmentsIds,
						},
					},
					attributes: {
						include: [[req.db.literal("amount * price"), "cash"]],
					},
					include: [
						{
							model: MovmentModel,
							attributes: ["date"],
						},
						{
							model: StoreModel,
							attributes: ["name"],
							include: [
								{
									model: SubstanceModel,
									attributes: ["name"],
								},
							],
						},
					],
					transaction: t,
					raw: true,
				});
				branchWithdrawalsCash.forEach((el) => {
					el.statement = `قيمة ${el.amount} لتر ${el["store.substance.name"]} مسحوبات مجنبة  (مسحوبات الفرع)`;
					el.date = el["movment.date"];
					el.creditor = el.cash;
					el.debtor = 0;
				});

				const prevBranchWithdrawalsCash = await BranchWithdrawalsModel.findAll({
					where: {
						employee_id: +req.query.employee,
						movment_id: {
							[Op.in]: prevMovmentsIds,
						},
					},
					attributes: [
						[req.db.literal("SUM(amount * price)"), "cash"], // This sums the amount * price
					],
					group: ["station_id"],

					transaction: t,
					raw: true,
				});

				const receives = await ReceivesModel.findAll({
					where: {
						employee_id: +req.query.employee,
						station_id: req.query.station,
						date: {
							[Op.between]: [req.query.startDate, req.query.endDate], // Assuming startDate and endDate are defined
						},
					},
					attributes: {
						include: [
							[
								req.db.literal(`CONCAT('مقابل توريد نقدي لصندوق المحطة')`),
								"statement",
							],
							[req.db.literal(`amount`), "creditor"],
							[req.db.literal(`0`), "debtor"],
						],
					},
					transaction: t,
					raw: true,
				});

				const prevReceives = await ReceivesModel.findAll({
					where: {
						employee_id: +req.query.employee,
						station_id: req.query.station,
						date: {
							[Op.lt]: startDate,
						},
					},
					attributes: [[req.db.literal("SUM(amount)"), "cash"]],
					group: ["station_id"],
					transaction: t,
					raw: true,
				});

				const opening = [
					{
						date: previousDay,
						id: "-",
						statement: "رصيد افتتاحي",
						debtor: +prevDispensersCash[0]?.cash || 0,
						creditor:
							+prevReceives[0]?.cash ||
							0 + +prevOthersCash[0]?.cash ||
							0 + +prevBranchWithdrawalsCash[0]?.cash ||
							0,
						// balance: el.creditor - el.debtor,
						balance:
							(+prevReceives[0]?.cash ||
								0 + +prevOthersCash[0]?.cash ||
								0 + +prevBranchWithdrawalsCash[0]?.cash ||
								0) - (+prevDispensersCash[0]?.cash || 0),
					},
				];
				const cash = dispensersCash
					.filter((el) => el.amount > 0)
					.concat(othersCash, branchWithdrawalsCash, receives, opening);
				// Sort the combined array based on the date in ascending order
				let perioddebtor = 0;
				let periodcreditor = 0;
				cash.sort((a, b) => new Date(a.date) - new Date(b.date));
				cash.forEach((el, i) => {
					if (i !== 0) {
						perioddebtor = perioddebtor + el.debtor;
						periodcreditor = periodcreditor + el.creditor;
						el.balance = cash[i - 1].balance + el.debtor - el.creditor;
					}
				});
				const station = await StationModel.findOne({
					where: {
						id: +req.query.station,
					},
					transaction: t,
					// raw: true,
				});
				const employee = await EmployeesModel.findOne({
					where: {
						id: +req.query.employee,
					},
					transaction: t,
					// raw: true,
				});
				const final_statment =
					cash[cash.length - 1].balance > 0
						? `دائن ${tafqeet(
							Math.abs(cash[cash.length - 1].balance),
						)} ريال فقط لا غير`
						: `مدين ${tafqeet(
							Math.abs(cash[cash.length - 1].balance),
						)} ريال فقط لا غير`;
				res.status(200).json({
					state: "success",
					data: {
						cash,
						info: {
							station_name: station.name,
							name: employee.name,
							startDate: req.query.startDate,
							endDate: req.query.endDate,
							perioddebtor,
							periodcreditor,
							final_statment,
						},
					},
				});
			});
		} catch (error) {
			return next(new AppError(error, 500));
		}
	},
);
exports.getStationAccountStatementReport = catchAsync(
	async (req, res, next) => {
		try {
			await req.db.transaction(async (t) => {
				const MovmentModel = getModel(req.year, "movment");
				const IncomeModel = getModel(req.year, "income");
				const SubstanceModel = getModel(req.year, "substance");
				const StoreModel = getModel(req.year, "store");
				const SurplusModel = getModel(req.year, "surplus");
				const priceMovmentEntriesModel = getModel(
					req.year,
					"price_movment_entries",
				);
				const BankModel = getModel(req.year, "bank");
				const DepositModel = getModel(req.year, "deposit");
				const StationModel = getModel(req.year, "station");
				const FinancialOperationsModel = getModel(
					req.year,
					"financial_operations",
				);
				const CreditSaleSettlementModel = getModel(
					req.year,
					"credit_sale_settlement",
				);
				const ClientModel = getModel(req.year, "client");
				const QuantityDeductionModel = getModel(req.year, "quantity_deduction");
				const startDate = new Date(req.query.startDate);
				const previousDay = new Date(startDate);
				previousDay.setDate(startDate.getDate() - 1);
				const movments = await MovmentModel.findAll({
					where: {
						station_id: req.query.station,
						date: {
							[Op.between]: [req.query.startDate, req.query.endDate], // Assuming startDate and endDate are defined
						},
					},
					raw: true,
					transaction: t,
				});

				const prevMovments = await MovmentModel.findAll({
					where: {
						station_id: req.query.station,
						date: {
							[Op.lt]: startDate, // This filters for dates less than the current date
						},
					},
					raw: true,
					transaction: t,
				});

				const movmentsIds = movments.map((el) => el.id);
				const prevMovmentsIds = prevMovments.map((el) => el.id);
				// العمليات المالية
				const financialOperations = await FinancialOperationsModel.findAll({
					where: {
						station_id: req.query.station,
						date: {
							[Op.between]: [req.query.startDate, req.query.endDate],
						},
					},
					transaction: t,
					raw: true,
				});

				//العمليات المالية السابقة
				const prevFinancialOperations = await FinancialOperationsModel.findAll({
					where: {
						station_id: +req.query.station,
						date: {
							[Op.lt]: startDate,
						},
					},
					attributes: [
						"station_id", // We want to group by station_id
						[req.db.literal("SUM(debtor)"), "debtor"],
						[req.db.literal("SUM(creditor)"), "creditor"],
					],
					include: [
						{
							model: StationModel,
							attributes: ["name"],
						},
					],
					group: ["station_id"],
					transaction: t,
					raw: true,
				});
				//حساب جانب المدين
				//الواردات
				const incomes = await IncomeModel.findAll({
					where: {
						station_id: +req.query.station,
						movment_id: {
							[Op.in]: movmentsIds,
						},
						type: "income",
					},
					attributes: {
						include: [
							[req.db.literal(`amount * price`), "debtor"],
							[req.db.literal(0), "creditor"],
							[req.db.col("movment.date"), "date"],
							"price",
						],
					},
					include: [
						{
							model: MovmentModel,
							attributes: ["date"],
						},
						{
							model: StoreModel,
							include: [{ model: SubstanceModel, attributes: ["name"] }],
							where: { type: "نقدي" },
						},
					],
					transaction: t,
					raw: true,
				});

				incomes.forEach((el) => {
					el.statement = `مقابل ${el.amount.toLocaleString("en")} لتر ${el["store.substance.name"]
						} وارد بسعر ${el.price}`;
				});
				// الواردات السابقة
				const prevIncomes = await IncomeModel.findAll({
					where: {
						station_id: +req.query.station,
						movment_id: {
							[Op.in]: prevMovmentsIds,
						},
						type: "income",
					},
					attributes: [
						"station_id", // We want to group by station_id
						[req.db.literal("SUM(price * amount)"), "debtor"], // Sum of price * amount
						[req.db.literal(0), "creditor"],
					],
					include: [
						{
							model: StoreModel,
							attributes: [],
							where: {
								type: "نقدي",
							},
							required: true,
						},
					],
					group: ["station_id"],
					transaction: t,
					raw: true,
				});
				// الارصدة الافتتاحية
				const openingBalance = await IncomeModel.findAll({
					where: {
						station_id: +req.query.station,
						// movment_id: {
						// 	[Op.in]: prevMovmentsIds,
						// },
						type: "initial",
					},
					attributes: {
						include: [
							[req.db.literal(`amount * price`), "debtor"],
							[req.db.literal(0), "creditor"],
							[req.db.col("movment.date"), "date"],
							"price",
						],
					},
					include: [
						{
							model: MovmentModel,
							attributes: ["date"],
						},
						{
							model: StoreModel,
							include: [{ model: SubstanceModel, attributes: ["name"] }],
							where: { type: "نقدي" },
						},
					],
					transaction: t,
					raw: true,
				});

				openingBalance.forEach((el) => {
					el.statement = `رصيد افتتاحي ${el.amount.toLocaleString("en")} لتر ${el["store.substance.name"]
						} بسعر ${el.price}`;
					const date = new Date(el.date);
					date.setDate(date.getDate() + 1);
					el.date = date.toISOString().split("T")[0];
				});
				const filteredOpeningBalance = openingBalance.filter(
					(el) =>
						new Date(el.date) >= new Date(req.query.startDate) &&
						new Date(el.date) <= new Date(req.query.endDate),
				);

				const filteredprevousOpeningBalance = openingBalance.filter(
					(el) => new Date(el.date) < new Date(req.query.startDate),
				);
				const prevOpeningBalance = filteredprevousOpeningBalance.reduce(
					(acc, el) => acc + el.debtor,
					0,
				);

				//الفائض
				const surplus = await SurplusModel.findAll({
					where: {
						station_id: +req.query.station,
						is_annual_stocktaking: 0,
						movment_id: {
							[Op.in]: movmentsIds,
						},
					},
					attributes: {
						include: [
							[req.db.literal(`amount * price`), "debtor"],
							[req.db.literal(0), "creditor"],
							[req.db.col("movment.date"), "date"],
							"price",
						],
					},
					include: [
						{
							model: MovmentModel,
							attributes: [],
						},
						{
							model: StoreModel,
							where: { type: "نقدي" },
							include: [{ model: SubstanceModel, attributes: ["name"] }],
						},
					],
					transaction: t,
					raw: true,
				});
				surplus.forEach((el) => {
					el.statement = `مقابل ${el.amount.toLocaleString("en")} لتر ${el["store.substance.name"]
						} فائض بسعر ${el.price}`;
				});
				//الفائض السابق
				const prevSurplus = await SurplusModel.findAll({
					where: {
						station_id: +req.query.station,
						is_annual_stocktaking: 0,
						movment_id: {
							[Op.in]: prevMovmentsIds,
						},
					},
					attributes: [
						"station_id",
						[req.db.literal("SUM(price * amount)"), "debtor"],
						[req.db.literal(0), "creditor"],
					],
					group: ["station_id"],
					transaction: t,
					raw: true,
				});

				//حساب جانب الدائن
				//التوريدات
				const deposits = await DepositModel.findAll({
					where: {
						station_id: req.query.station,
						invoice_date: {
							[Op.between]: [req.query.startDate, req.query.endDate], // Assuming startDate and endDate are defined
						},
					},
					attributes: {
						include: [
							[req.db.literal(`amount`), "creditor"],
							[req.db.literal(0), "debtor"],
							[req.db.col("invoice_date"), "date"],
						],
					},
					include: [
						{
							model: BankModel,
							attributes: ["name"],
						},
					],
					transaction: t,
					raw: true,
				});
				deposits.forEach((el) => {
					el.statement = `مقابل توريد ${el.amount.toLocaleString(
						"en",
					)} ريال لـ ${el["bank.name"]}`;
				});
				//سداد المبيعات الآجلة
				const creditSalesSettlements = await CreditSaleSettlementModel.findAll({
					where: {
						station_id: +req.query.station,
						date: {
							[Op.between]: [req.query.startDate, req.query.endDate], // Assuming startDate and endDate are defined
						},
						type: "قيد مالي",
					},
					include: [
						{
							model: StoreModel,
							attributes: ["name"],
							where: { type: "نقدي" },
						},
						{
							model: ClientModel,
							attributes: ["name"],
						},
					],
					transaction: t,
					raw: true,
				});
				creditSalesSettlements.forEach((el) => {
					el.statement = `سداد مبيعات آجلة لـ ${el["client.name"]} ${el.type === "نقدي"
							? "نقداً"
							: `ب${el.type} رقم ${el.operation_number}`
						}`;
					el.creditor = el.amount;
					el.debtor = 0;
				});
				// حساب فوارق التسعيرة
				const priceMovmentEntries = await priceMovmentEntriesModel.findAll({
					where: {
						station_id: req.query.station,
						date: {
							[Op.between]: [req.query.startDate, req.query.endDate],
						},
					},
					include: [
						{
							model: StoreModel,
							include: [{ model: SubstanceModel, attributes: ["name"] }],
							where: { type: "نقدي" },
						},
					],
					transaction: t,
					raw: true,
				});
				priceMovmentEntries.forEach((el) => {
					el.statement = `مقابل تغير السعر من ${el.prev_price} الى ${el.curr_price} ريال لـ ${el.amount} لتر ${el["store.substance.name"]}`;
				});
				//حساب استنزال كمية
				const quantityDeductions = await QuantityDeductionModel.findAll({
					where: {
						station_id: req.query.station,
						// is_annual_stocktaking: 0,
						date: {
							[Op.between]: [req.query.startDate, req.query.endDate],
						},
						with_value: {
							[Op.ne]: 0,
						},
					},
					include: [
						{
							model: StoreModel,
							include: [{ model: SubstanceModel, attributes: ["name"] }],
							where: { type: "نقدي" },
						},
					],
					transaction: t,
					raw: true,
				});
				quantityDeductions.forEach((el) => {
					el.statement = `مقابل استنزال ${el.amount} لتر ${el["store.substance.name"]} بسعر ${el.price}`;
					el.creditor = el.amount * el.price;
					el.debtor = 0;
				});

				//سدادات سابقة
				const prevCreditSalesSettlements =
					await CreditSaleSettlementModel.findAll({
						where: {
							station_id: req.query.station,
							date: {
								[Op.lt]: startDate,
							},
							type: "قيد مالي",
						},
						attributes: [
							[req.db.literal("SUM(amount)"), "creditor"],
							[req.db.literal(0), "debtor"],
						],
						group: ["station_id"],
						transaction: t,
						raw: true,
					});

				//التوريدات السابقة
				const prevDeposits = await DepositModel.findAll({
					where: {
						station_id: req.query.station,
						invoice_date: {
							[Op.lt]: startDate,
						},
					},
					attributes: [
						[req.db.literal("SUM(amount)"), "creditor"],
						[req.db.literal(0), "debtor"],
					],
					group: ["station_id"],
					transaction: t,
					raw: true,
				});
				// حساب فوارق التسعيرة السابقة
				const prevPriceMovmentEntries = await priceMovmentEntriesModel.findAll({
					where: {
						station_id: req.query.station,
						date: {
							[Op.lt]: startDate,
						},
					},
					include: [
						{
							model: StoreModel,
							include: [{ model: SubstanceModel, attributes: ["name"] }],
							where: { type: "نقدي" },
						},
					],
					attributes: [
						"station_id",
						[req.db.literal("SUM(creditor)"), "total_creditor"],
						[req.db.literal("SUM(debtor)"), "total_debtor"],
					],
					group: ["station_id"],
					transaction: t,
					raw: true,
				});
				// حساب استنزال كميات السابقة
				const prevQuantityDeduction = await QuantityDeductionModel.findAll({
					where: {
						station_id: req.query.station,
						// is_annual_stocktaking: 0,
						date: {
							[Op.lt]: startDate,
						},
						with_value: {
							[Op.ne]: 0,
						},
					},
					attributes: [
						[req.db.literal("SUM(amount*price)"), "total_creditor"],
						[req.db.literal(0), "total_debtor"],
					],
					group: ["station_id"],
					transaction: t,
					raw: true,
				});

				//حساب الرصيد الافتتاحي
				const opening = [
					{
						date: previousDay,
						id: "-",
						statement: "رصيد سابق",
						debtor:
							(+prevIncomes[0]?.debtor || 0) +
							+prevOpeningBalance +
							(+prevSurplus[0]?.debtor || 0) +
							(+prevQuantityDeduction[0]?.total_debtor || 0) +
							(+prevFinancialOperations[0]?.debtor || 0) +
							(+prevPriceMovmentEntries[0]?.total_debtor || 0),
						creditor:
							(+prevDeposits[0]?.creditor || 0) +
							(+prevCreditSalesSettlements[0]?.creditor || 0) +
							(+prevQuantityDeduction[0]?.total_creditor || 0) +
							(+prevFinancialOperations[0]?.creditor || 0) +
							(+prevPriceMovmentEntries[0]?.total_creditor || 0),
						balance:
							(+prevIncomes[0]?.debtor || 0) +
							+prevOpeningBalance +
							(+prevSurplus[0]?.debtor || 0) -
							(+prevDeposits[0]?.creditor || 0) -
							(+prevQuantityDeduction[0]?.total_creditor || 0) +
							(+prevPriceMovmentEntries[0]?.total_debtor || 0) -
							(+prevCreditSalesSettlements[0]?.creditor || 0) -
							(+prevFinancialOperations[0]?.creditor || 0) -
							(+prevPriceMovmentEntries[0]?.total_creditor || 0),
					},
				];

				const cash = opening.concat(
					filteredOpeningBalance,
					financialOperations,
					deposits,
					surplus,
					incomes,
					priceMovmentEntries,
					creditSalesSettlements,
					quantityDeductions,
				);
				//ترتيب حسب التاريخ
				let perioddebtor = 0;
				let periodcreditor = 0;
				cash.sort((a, b) => new Date(a.date) - new Date(b.date));
				cash.forEach((el, i) => {
					if (i !== 0) {
						perioddebtor = perioddebtor + +el.debtor;
						periodcreditor = periodcreditor + +el.creditor;
						el.balance = cash[i - 1].balance + +el.debtor - +el.creditor;
					}
				});
				const station = await StationModel.findOne({
					where: {
						id: +req.query.station,
					},
					transaction: t,
				});

				const final_statment =
					cash[cash.length - 1].balance < 0
						? `دائن ${tafqeet(
							Math.abs(cash[cash.length - 1].balance),
						)} ريال فقط لا غير`
						: `مدين ${tafqeet(
							Math.abs(cash[cash.length - 1].balance),
						)} ريال فقط لا غير`;
				res.status(200).json({
					state: "success",
					data: {
						cash,
						info: {
							station_name: station.name,
							startDate: req.query.startDate,
							endDate: req.query.endDate,
							perioddebtor,
							periodcreditor,
							final_statment,
							name: "المحطة",
						},
					},
				});
			});
		} catch (error) {
			return next(new AppError(error, 500));
		}
	},
);
exports.getBoxAccountStatementReport = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const MovmentModel = getModel(req.year, "movment");
			const StoreModel = getModel(req.year, "store");
			const DepositModel = getModel(req.year, "deposit");
			const BankModel = getModel(req.year, "bank");
			const StationModel = getModel(req.year, "station");
			const SubstanceModel = getModel(req.year, "substance");
			const CreditSaleSettlementModel = getModel(
				req.year,
				"credit_sale_settlement",
			);
			const OtherModel = getModel(req.year, "other");
			const DispenserMovmentModel = getModel(req.year, "dispenser_movment");
			const BranchWithdrawalsModel = getModel(req.year, "branch_withdrawals");
			const CreditSaleModel = getModel(req.year, "credit_sale");
			const CalibrationModel = getModel(req.year, "calibration");
			const ClientModel = getModel(req.year, "client");
			const DispenserModel = getModel(req.year, "dispenser");
			const TankModel = getModel(req.year, "tank");
			const startDate = new Date(req.query.startDate);
			const previousDay = new Date(startDate);
			previousDay.setDate(startDate.getDate() - 1);
			const movments = await MovmentModel.findAll({
				where: {
					station_id: req.query.station,
					date: {
						[Op.between]: [req.query.startDate, req.query.endDate], // Assuming startDate and endDate are defined
					},
				},
				raw: true,
				transaction: t,
			});

			const prevMovments = await MovmentModel.findAll({
				where: {
					station_id: req.query.station,
					date: {
						[Op.lt]: startDate, // This filters for dates less than the current date
					},
				},
				raw: true,
				transaction: t,
			});
			const stores = await StoreModel.findAll({
				where: {
					station_id: req.query.station,
					type: "نقدي",
				},
				attributes: ["id"],
				raw: true,
				transaction: t,
			});
			const storesIds = stores.map((el) => el.id);
			const movmentsIds = movments.map((el) => el.id);
			const prevMovmentsIds = prevMovments.map((el) => el.id);
			//حساب جانب المدين
			//التوريدات
			const deposits = await DepositModel.findAll({
				where: {
					station_id: req.query.station,
					invoice_date: {
						[Op.between]: [req.query.startDate, req.query.endDate], // Assuming startDate and endDate are defined
					},
				},
				attributes: {
					include: [
						[req.db.literal(`amount`), "debtor"],
						[req.db.literal(0), "creditor"],
						[req.db.col("invoice_date"), "date"],
					],
				},
				include: [
					{
						model: BankModel,
						attributes: ["name"],
					},
				],
				transaction: t,
				raw: true,
			});
			deposits.forEach((el) => {
				el.statement = `مقابل توريد ${el.amount.toLocaleString("en")} ريال ل${el["bank.name"]
					}`;
			});
			//التوريدات السابقة
			const prevDeposits = await DepositModel.findAll({
				where: {
					station_id: req.query.station,
					invoice_date: {
						[Op.lt]: startDate,
					},
				},
				attributes: [
					[req.db.literal("SUM(amount)"), "debtor"],
					[req.db.literal(0), "creditor"],
				],
				group: ["station_id"],
				transaction: t,
				raw: true,
			});

			// //  سداد المبيعات الآجلة حسب المادة والحركة
			// const creditSalesSettlementsCash =
			// 	await CreditSaleSettlementModel.findAll({
			// 		where: {
			// 			station_id: req.query.station,
			// 			date: {
			// 				[Op.between]: [req.query.startDate, req.query.endDate],
			// 			},
			// 		},
			// 		attributes: [
			// 			"store.substance.id",
			// 			[req.db.fn("SUM", req.db.col("amount")), "total_cash"],
			// 		],
			// 		include: [
			// 			{
			// 				model: StoreModel,
			// 				attributes: ["type"],
			// 				where: { type: { [Op.in]: ["نقدي", "خصم كمية"] } },
			// 				include: [
			// 					{
			// 						model: SubstanceModel,
			// 						attributes: ["id"],
			// 					},
			// 				],
			// 			},
			// 		],
			// 		raw: true,
			// 		transaction: t,
			// 	});
			// creditSalesSettlementsCash.forEach((el) => {
			// 	el.debtor = el.amount;
			// 	el.statement =
			// 		`سداد مبيعات آجلة لـ ${el["client.name"]} ` +
			// 		(el.type === "نقدي"
			// 			? "نقداً"
			// 			: el.type === "خصم كمية"
			// 			? `ب${el.type}`
			// 			: `ب${el.type} رقم ${el.operation_number}`);
			// 	el.creditor = 0;
			// });
			// const prevCreditSalesSettlementsCash =
			// 	await CreditSaleSettlementModel.findAll({
			// 		where: {
			// 			station_id: req.query.station,
			// 			date: {
			// 				[Op.lt]: startDate, // This filters for dates less than the current date
			// 			},
			// 		},
			// 		attributes: [
			// 			[req.db.literal("SUM(amount)"), "cash"], // This sums the amount * price
			// 		],
			// 		group: ["station_id"],
			// 		transaction: t,
			// 		raw: true,
			// 	});
			const CreditSaleSettlements = await CreditSaleSettlementModel.findAll({
				where: {
					station_id: req.query.station,
					store_id: { [Op.in]: storesIds },
					date: {
						[Op.between]: [req.query.startDate, req.query.endDate],
					},
					type: { [Op.in]: ["خصم كمية", "نقدي"] },
				},
				include: [
					{
						model: ClientModel,
						attributes: ["name"],
					},
				],

				transaction: t,
				raw: true,
			});
			CreditSaleSettlements.forEach((el) => {
				el.creditor = el.amount;
				el.statement = `سداد مبيعات آجلة لـ ${el["client.name"]} بتاريخ ${el.date} `;
				el.debtor = 0;
			});

			const prevCreditSalesSettlements =
				await CreditSaleSettlementModel.findAll({
					where: {
						station_id: req.query.station,
						store_id: { [Op.in]: storesIds },
						date: {
							[Op.lt]: startDate,
						},
						type: { [Op.in]: ["خصم كمية", "نقدي"] },
					},
					attributes: [[req.db.literal("SUM(amount)"), "creditor"]],
					group: ["station_id"],
					transaction: t,
					raw: true,
				});
			//حساب جانب الدائن
			//فرق حركة المخازن النقدية
			const dispensers = await DispenserMovmentModel.findAll({
				where: {
					station_id: req.query.station,
					movment_id: {
						[Op.in]: movmentsIds,
					},
				},
				attributes: [
					"dispenser.tank.substance.id",
					"dispenser.tank.substance.name",
					"movment.id",
					"price",
					[
						req.db.literal("SUM((curr_A + curr_B - prev_A - prev_B) * price)"),
						"creditor",
					],
					[req.db.literal("SUM(curr_A + curr_B - prev_A - prev_B)"), "amount"],
				],
				include: [
					{
						model: MovmentModel,
						attributes: ["id", "date"],
					},
					{
						model: DispenserModel,
						attributes: [],
						include: [
							{
								model: TankModel,
								attributes: [],
								include: [
									{
										model: SubstanceModel,
										attributes: ["id", "name"],
									},
								],
							},
						],
					},
				],
				group: ["movment.id", "dispenser.tank.substance.id", "price"],
				transaction: t,
				raw: true,
			});
			const prevDispensersCash = await DispenserMovmentModel.findAll({
				where: {
					station_id: req.query.station,
					movment_id: {
						[Op.in]: prevMovmentsIds,
					},
				},
				attributes: [
					[req.db.literal("SUM(curr_A + curr_B - prev_A - prev_B)"), "amount"],
					[
						req.db.literal("SUM((curr_A - prev_A + curr_B - prev_B) * price)"),
						"creditor",
					],
				],
				group: ["station_id"],
				transaction: t,
				raw: true,
			});
			//  مسحوبات اخرى حسب المادة والحركة
			const othersCash = await OtherModel.findAll({
				where: {
					station_id: req.query.station,
					movment_id: {
						[Op.in]: movmentsIds,
					},
				},
				attributes: [
					"store.substance.id",
					"movment.id",
					[req.db.fn("SUM", req.db.col("amount")), "total_amount"],
					[req.db.literal("SUM(amount * price)"), "total_cash"],
				],
				include: [
					{
						model: MovmentModel,
						attributes: ["id", "date"],
					},
					{
						model: StoreModel,
						attributes: [],
						include: [
							{
								model: SubstanceModel,
								attributes: ["id"],
							},
						],
					},
				],
				group: ["movment.id", "store.substance.id"],
				raw: true,
				transaction: t,
			});
			const prevOthersCash = await OtherModel.findAll({
				where: {
					station_id: req.query.station,
					movment_id: {
						[Op.in]: prevMovmentsIds,
					},
				},
				attributes: [
					[req.db.literal("SUM(amount * price)"), "cash"], // This sums the amount * price
				],
				group: ["station_id"],
				transaction: t,
				raw: true,
			});
			//  معايرة حسب المادة والحركة
			const calibrationsCash = await CalibrationModel.findAll({
				where: {
					station_id: req.query.station,
					movment_id: {
						[Op.in]: movmentsIds,
					},
				},
				attributes: [
					"store.substance.id",
					"movment.id",
					[req.db.fn("SUM", req.db.col("amount")), "total_amount"],
					[req.db.literal("SUM(amount * price)"), "total_cash"],
				],
				include: [
					{
						model: MovmentModel,
						attributes: ["id", "date"],
					},
					{
						model: StoreModel,
						attributes: [],
						include: [
							{
								model: SubstanceModel,
								attributes: ["id"],
							},
						],
					},
				],
				group: ["movment.id", "store.substance.id"],
				raw: true,
				transaction: t,
			});

			const prevCalibrationsCash = await CalibrationModel.findAll({
				where: {
					station_id: req.query.station,
					movment_id: {
						[Op.in]: prevMovmentsIds,
					},
				},
				attributes: [
					[req.db.literal("SUM(amount * price)"), "cash"], // This sums the amount * price
				],
				group: ["station_id"],
				transaction: t,
				raw: true,
			});
			//  مبيعات آجلة حسب المادة والحركة
			const creditSalesCash = await CreditSaleModel.findAll({
				where: {
					station_id: req.query.station,
					movment_id: {
						[Op.in]: movmentsIds,
					},
				},
				attributes: [
					"store.substance.id",
					"movment.id",
					[req.db.fn("SUM", req.db.col("amount")), "total_amount"],
					[req.db.literal("SUM(amount * price)"), "total_cash"],
				],
				include: [
					{
						model: MovmentModel,
						attributes: ["id", "date"],
					},
					{
						model: StoreModel,
						attributes: [],
						include: [
							{
								model: SubstanceModel,
								attributes: ["id"],
							},
						],
					},
				],
				group: ["movment.id", "store.substance.id"],
				raw: true,
				transaction: t,
			});
			const prevCreditSalesCash = await CreditSaleModel.findAll({
				where: {
					station_id: req.query.station,
					movment_id: {
						[Op.in]: prevMovmentsIds,
					},
				},
				attributes: [
					[req.db.literal("SUM(amount * price)"), "cash"], // This sums the amount * price
				],
				group: ["station_id"],
				transaction: t,
				raw: true,
			});

			// حساب المبيعات النقدية فقط
			dispensers.forEach((dispenser) => {
				const other = othersCash.filter(
					(el) =>
						el["movment.id"] === dispenser["movment.id"] &&
						el["store.substance.id"] ===
						dispenser["dispenser.tank.substance.id"],
				)[0];

				// const branchWithdrawals = branchWithdrawalsCash.filter(
				// 	(el) =>
				// 		el["movment.id"] === dispenser["movment.id"] &&
				// 		el["store.substance.id"] ===
				// 			dispenser["dispenser.tank.substance.id"]
				// )[0];
				const calibration = calibrationsCash.filter(
					(el) =>
						el["movment.id"] === dispenser["movment.id"] &&
						el["store.substance.id"] ===
						dispenser["dispenser.tank.substance.id"],
				)[0];
				const creditSales = creditSalesCash.filter(
					(el) =>
						el["movment.id"] === dispenser["movment.id"] &&
						el["store.substance.id"] ===
						dispenser["dispenser.tank.substance.id"],
				)[0];
				if (other) {
					dispenser.creditor = +dispenser.creditor - +other.total_cash;
					dispenser.amount = +dispenser.amount - +other.total_amount;
				}
				if (calibration) {
					dispenser.creditor = +dispenser.creditor - +calibration.total_cash;
					dispenser.amount = +dispenser.amount - +calibration.total_amount;
				}
				if (creditSales) {
					dispenser.creditor = +dispenser.creditor - +creditSales.total_cash;
					dispenser.amount = +dispenser.amount - +creditSales.total_amount;
				}
				dispenser.statement = `قيمة مبيعات ${dispenser.amount} لتر ${dispenser["dispenser.tank.substance.name"]} بسعر ${dispenser.price}`;
				// dispenser.creditor = +dispenser.amount * +dispenser.price;
				dispenser.debtor = 0;
				dispenser.date = dispenser["movment.date"];
			});

			//حساب الرصيد الافتتاحي
			const opening = [
				{
					date: previousDay,
					id: "-",
					statement: "رصيد سابق",
					creditor:
						(+prevDispensersCash[0]?.creditor || 0) -
						(+prevCreditSalesCash[0]?.cash || 0) -
						(+prevCalibrationsCash[0]?.cash || 0) -
						(+prevOthersCash[0]?.cash || 0) +
						(+prevCreditSalesSettlements[0]?.creditor || 0),
					debtor:
						(+prevDeposits[0]?.debtor || 0) +
						(+prevCreditSalesSettlements[0]?.debtor || 0),
					balance:
						(+prevDispensersCash[0]?.creditor || 0) -
						(+prevCreditSalesCash[0]?.cash || 0) -
						(+prevCalibrationsCash[0]?.cash || 0) -
						(+prevOthersCash[0]?.cash || 0) +
						(+prevCreditSalesSettlements[0]?.creditor || 0) -
						(+prevDeposits[0]?.debtor || 0) -
						(+prevCreditSalesSettlements[0]?.debtor || 0),
				},
			];
			//ترتيب حسب التاريخ
			const cash = opening.concat(
				dispensers.filter((el) => el.amount > 0),
				CreditSaleSettlements,
				deposits,
			);
			let perioddebtor = 0;
			let periodcreditor = 0;
			cash.sort((a, b) => new Date(a.date) - new Date(b.date));
			cash.forEach((el, i) => {
				if (i !== 0) {
					perioddebtor = perioddebtor + el.debtor;
					periodcreditor = periodcreditor + +el.creditor;
					el.balance = cash[i - 1].balance - +el.debtor + +el.creditor;
				}
			});

			const station = await StationModel.findOne({
				where: {
					id: +req.query.station,
				},
				transaction: t,
			});
			const final_statment =
				cash[cash.length - 1].balance > 0
					? `دائن ${tafqeet(
						Math.abs(cash[cash.length - 1].balance),
					)} ريال فقط لا غير`
					: `مدين ${tafqeet(
						Math.abs(cash[cash.length - 1].balance),
					)} ريال فقط لا غير`;
			res.status(200).json({
				state: "success",
				data: {
					cash,
					info: {
						station_name: station.name,
						startDate: req.query.startDate,
						endDate: req.query.endDate,
						perioddebtor,
						periodcreditor,
						final_statment,
						name: "الصندوق",
					},
				},
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getBranchStatementReport = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const MovmentModel = getModel(req.year, "movment");
			const StoreModel = getModel(req.year, "store");
			const SubstanceModel = getModel(req.year, "substance");
			const BranchWithdrawalsModel = getModel(req.year, "branch_withdrawals");
			const StationModel = getModel(req.year, "station");
			const CreditSaleSettlementModel = getModel(
				req.year,
				"credit_sale_settlement",
			);

			const startDate = new Date(req.query.startDate);
			const previousDay = new Date(startDate);
			previousDay.setDate(startDate.getDate() - 1);
			const movments = await MovmentModel.findAll({
				where: {
					station_id: req.query.station,
					date: {
						[Op.between]: [req.query.startDate, req.query.endDate], // Assuming startDate and endDate are defined
					},
				},
				raw: true,
				transaction: t,
			});

			const prevMovments = await MovmentModel.findAll({
				where: {
					station_id: req.query.station,
					date: {
						[Op.lt]: startDate, // This filters for dates less than the current date
					},
				},
				raw: true,
				transaction: t,
			});
			const movmentsIds = movments.map((el) => el.id);
			const prevMovmentsIds = prevMovments.map((el) => el.id);
			//حساب جانب المدين
			//مسحوبات الفرع
			const branchwithdrawals = await BranchWithdrawalsModel.findAll({
				where: {
					station_id: req.query.station,
					movment_id: {
						[Op.in]: movmentsIds, // Assuming startDate and endDate are defined
					},
				},
				include: [
					{
						model: MovmentModel,
						attributes: ["date"],
					},
					{
						model: StoreModel,
						attributes: ["name"],
						include: [
							{
								model: SubstanceModel,
								attributes: ["name"],
							},
						],
					},
				],
				transaction: t,
				raw: true,
			});
			branchwithdrawals.forEach((el) => {
				el.statement = `مقابل ${el.amount} لتر ${el["store.substance.name"]} مسحوبات الفرع`;
				el.date = el["movment.date"];
				el.debtor = el.amount * el.price;
				el.creditor = 0;
			});
			// مسحوبات الفرع السابقة
			const prevBranchwithdrawals = await BranchWithdrawalsModel.findAll({
				where: {
					station_id: req.query.station,
					movment_id: {
						[Op.in]: prevMovmentsIds,
					},
				},
				attributes: [
					"station_id",
					[req.db.literal("COALESCE(SUM(amount * price), 0)"), "creditor"],
					[req.db.literal(0), "debtor"],
				],
				group: ["station_id"],
				transaction: t,
				raw: true,
			});

			//حساب جانب الدائن
			//حساب سدادات المالية
			const settlemts = await CreditSaleSettlementModel.findAll({
				where: {
					station_id: req.query.station,
					date: {
						[Op.between]: [req.query.startDate, req.query.endDate],
					},
					type: "branch",
				},
				transaction: t,
				raw: true,
			});
			settlemts.forEach((el) => {
				el.creditor = el.amount;
				el.statement = `سداد مسحوبات الفرع بقيد مالي رقم ${el.id}`;
				el.debtor = 0;
			});
			const prevSettlemts = await CreditSaleSettlementModel.findAll({
				where: {
					station_id: req.query.station,
					date: {
						[Op.lt]: startDate,
					},
					type: "branch",
				},
				attributes: [[req.db.literal("SUM(amount)"), "creditor"]],
				group: ["station_id"],
				transaction: t,
				raw: true,
			});
			//حساب الرصيد الافتتاحي
			const opening = [
				{
					date: previousDay,
					id: "-",
					statement: "رصيد سابق",
					debtor: +prevSettlemts[0]?.debtor || 0,
					creditor: +prevBranchwithdrawals[0]?.creditor || 0,
					balance:
						(+prevBranchwithdrawals[0]?.creditor || 0) -
						(+prevSettlemts[0]?.debtor || 0),
				},
			];
			//ترتيب حسب التاريخ
			const cash = opening.concat(settlemts, branchwithdrawals);

			let perioddebtor = 0;
			let periodcreditor = 0;
			cash.sort((a, b) => new Date(a.date) - new Date(b.date));

			cash.forEach((el, i) => {
				if (i !== 0) {
					perioddebtor = perioddebtor + el.debtor;
					periodcreditor = periodcreditor + +el.creditor;

					el.balance = cash[i - 1].balance - +el.debtor + +el.creditor;
				}
			});

			const station = await StationModel.findOne({
				where: {
					id: +req.query.station,
				},
				transaction: t,
			});

			const final_statment =
				cash[cash.length - 1].balance > 0
					? `دائن ${tafqeet(
						Math.abs(cash[cash.length - 1].balance),
					)} ريال فقط لا غير`
					: `مدين ${tafqeet(
						Math.abs(cash[cash.length - 1].balance),
					)} ريال فقط لا غير`;
			res.status(200).json({
				state: "success",
				data: {
					cash,
					info: {
						station_name: station.name,
						startDate: req.query.startDate,
						endDate: req.query.endDate,
						perioddebtor,
						periodcreditor,
						final_statment,
						name: "مبيعات آجلة",
					},
				},
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getCreditSalesStatementReport = catchAsync(async (req, res, next) => {
	try {
		
		await req.db.transaction(async (t) => {
			const MovmentModel = getModel(req.year, "movment");
			const StoreModel = getModel(req.year, "store");
			const SubstanceModel = getModel(req.year, "substance");
			const CreditSaleModel = getModel(req.year, "credit_sale");
			const ClientModel = getModel(req.year, "client");
			const CreditSaleSettlementModel = getModel(
				req.year,
				"credit_sale_settlement",
			);
			const StationModel = getModel(req.year, "station");

			const startDate = new Date(req.query.startDate);
			const previousDay = new Date(startDate);
			previousDay.setDate(startDate.getDate() - 1);

			const clientIds = (req.query.clients && req.query.clients !== 'all') ? req.query.clients.split(',').map(Number).filter(id => !isNaN(id)) : [];

			let clientsName = "";
			if (clientIds.length > 0) {
				const selectedClientsData = await ClientModel.findAll({
					where: { id: { [Op.in]: clientIds } },
					attributes: ["name"],
					transaction: t,
				});
				clientsName = selectedClientsData.map((c) => c.name).join(", ");
			} else {
				const ClientStationsModel = getModel(req.year, "client_station");
				const allClientsOfStation = await ClientStationsModel.findAll({
					where: { station_id: req.query.station },
					include: [
						{
							model: ClientModel,
							attributes: ["name"],
						},
					],
					transaction: t,
				});
				clientsName = allClientsOfStation.map((c) => c.client?.name).filter(Boolean).join(", ");
			}

			const movments = await MovmentModel.findAll({
				where: {
					station_id: req.query.station,
					date: {
						[Op.between]: [req.query.startDate, req.query.endDate], // Assuming startDate and endDate are defined
					},
				},
				raw: true,
				transaction: t,
			});
			const store = await StoreModel.findByPk(req.query.store, {
				include: [
					{
						model: SubstanceModel,
						attributes: ["name"],
					},
				],
				raw: true,
				transaction: t,
			});

			const prevMovments = await MovmentModel.findAll({
				where: {
					station_id: req.query.station,
					date: {
						[Op.lt]: startDate, // This filters for dates less than the current date
					},
				},
				raw: true,
				transaction: t,
			});
			const movmentsIds = movments.map((el) => el.id);
			const prevMovmentsIds = prevMovments.map((el) => el.id);
			//حساب جانب الدائن
			//مبيعات آجلة
			const creditSales = await CreditSaleModel.findAll({
				where: {
					station_id: req.query.station,
					store_id: req.query.store,
					movment_id: {
						[Op.in]: movmentsIds, // Assuming startDate and endDate are defined
					},
					...(clientIds.length > 0 && { client_id: { [Op.in]: clientIds } }),
				},
				include: [
					{
						model: MovmentModel,
						attributes: ["date"],
					},
					{
						model: ClientModel,
						attributes: ["name"],
					},
					{
						model: StoreModel,
						attributes: ["name"],
						include: [
							{
								model: SubstanceModel,
								attributes: ["name"],
							},
						],
					},
				],
				transaction: t,
				raw: true,
			});

			creditSales.forEach((el) => {
				el.statement = `مقابل ${el.amount} لتر ${el["store.substance.name"]} مبيعات آجلة ل ${el["client.name"]} بسعر ${el.price}`;
				el.date = el["movment.date"];
				el.creditor = el.amount * el.price;
				el.debtor = 0;
			});
			// مبيعات آجلة سابقة
			const prevCreditSales = await CreditSaleModel.findAll({
				where: {
					station_id: req.query.station,
					store_id: req.query.store,
					movment_id: {
						[Op.in]: prevMovmentsIds,
					},
					...(clientIds.length > 0 && { client_id: { [Op.in]: clientIds } }),
				},
				attributes: [
					"station_id",
					[req.db.literal("COALESCE(SUM(amount * price), 0)"), "creditor"],
					[req.db.literal(0), "debtor"],
				],
				group: ["station_id"],
				transaction: t,
				raw: true,
			});
			//حساب الجانب المدين
			//حساب سدادات المالية
			const settlemts = await CreditSaleSettlementModel.findAll({
				where: {
					station_id: req.query.station,
					store_id: req.query.store,
					date: {
						[Op.between]: [req.query.startDate, req.query.endDate],
					},
					...(clientIds.length > 0 && { client_id: { [Op.in]: clientIds } }),
				},
				include: [
					{
						model: ClientModel,
						attributes: ["name"],
					},
				],
				transaction: t,
				raw: true,
			});
			settlemts.forEach((el) => {
				el.debtor = el.amount;
				el.statement =
					`سداد مبيعات آجلة لـ ${el["client.name"]} ` +
					(el.type === "نقدي"
						? "نقداً"
						: el.type === "خصم كمية"
							? `ب${el.type}`
							: `ب${el.type} رقم ${el.operation_number}`);
				el.creditor = 0;
			});

			const prevSettlemts = await CreditSaleSettlementModel.findAll({
				where: {
					station_id: req.query.station,
					store_id: req.query.store,
					date: {
						[Op.lt]: startDate,
					},
					...(clientIds.length > 0 && { client_id: { [Op.in]: clientIds } }),
				},
				attributes: [[req.db.literal("SUM(amount)"), "debtor"]],
				group: ["station_id"],
				transaction: t,
				raw: true,
			});
			//حساب الرصيد الافتتاحي
			const opening = [
				{
					date: previousDay,
					id: "-",
					statement: "رصيد سابق",
					amount: "-",
					price: "-",
					debtor: +prevSettlemts[0]?.debtor || 0,
					creditor: +prevCreditSales[0]?.creditor || 0,
					balance:
						(+prevCreditSales[0]?.creditor || 0) -
						(+prevSettlemts[0]?.debtor || 0),
				},
			];

			//ترتيب حسب التاريخ
			const cash = opening.concat(settlemts, creditSales);

			let perioddebtor = 0;
			let periodcreditor = 0;
			cash.sort((a, b) => new Date(a.date) - new Date(b.date));

			cash.forEach((el, i) => {
				if (i !== 0) {
					perioddebtor = perioddebtor + el.debtor;
					periodcreditor = periodcreditor + +el.creditor;
					el.balance = cash[i - 1].balance - +el.debtor + +el.creditor;
				}
			});

			const station = await StationModel.findOne({
				where: {
					id: +req.query.station,
				},
				transaction: t,
			});

			const final_statment =
				cash[cash.length - 1].balance > 0
					? `دائن ${tafqeet(
						Math.abs(cash[cash.length - 1].balance),
					)} ريال فقط لا غير`
					: `مدين ${tafqeet(
						Math.abs(cash[cash.length - 1].balance),
					)} ريال فقط لا غير`;
			res.status(200).json({
				state: "success",
				data: {
					cash,
					info: {
						station_name: station.name,
						store_name: `${store.name} - ${store["substance.name"]}`,
						startDate: req.query.startDate,
						endDate: req.query.endDate,
						perioddebtor,
						periodcreditor,
						final_statment,
						name: "مبيعات آجلة",
						clients: clientsName,
					},
				},
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getStocktakingPriceReport = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const StocktakingModel = getModel(req.year, "stocktaking");
			const StocktakingMembersModel = getModel(req.year, "stocktaking_members");
			const StocktakingStoresMovmentsModel = getModel(
				req.year,
				"stocktaking_stores_movments",
			);
			const StationModel = getModel(req.year, "station");
			const SubstanceModel = getModel(req.year, "substance");
			const MovmentModel = getModel(req.year, "movment");
			const MovmentsShiftsModel = getModel(req.year, "movments_shift");
			const DispenserModel = getModel(req.year, "dispenser");
			const DispenserMovmentModel = getModel(req.year, "dispenser_movment");
			const TankModel = getModel(req.year, "tank");
			const StoreModel = getModel(req.year, "store");
			const stocktaking = await StocktakingModel.findByPk(req.params.id, {
				raw: true,
				include: [
					{ model: StationModel, attributes: ["name"] },
					{ model: SubstanceModel, attributes: ["name"] },
				],
			});
			const lastMovment = await MovmentModel.findByPk(stocktaking.movment_id);
			const lastShift = await MovmentsShiftsModel.findOne({
				where: {
					movment_id: stocktaking.movment_id,
					number: lastMovment.shifts,
				},
			});
			const dispensers = await DispenserMovmentModel.findAll({
				where: {
					movment_id: stocktaking.movment_id,
					shift_id: lastShift.id,
				},
				include: [
					{
						model: DispenserModel,
						attributes: ["id", "number"],
						include: [
							{
								model: TankModel,
								attributes: ["id"],
								include: [
									{
										model: SubstanceModel,
										attributes: ["id", "name"],
										where: { id: stocktaking.substance_id },
										required: true,
									},
								],
								required: true,
							},
						],
						required: true,
					},
				],
				raw: true,
			});
			dispensers.forEach((el) => {
				el.name = `${el["dispenser.number"]}-${el["dispenser.tank.substance.name"]}`;
			});
			const stores = await StocktakingStoresMovmentsModel.findAll({
				where: {
					stocktaking_id: stocktaking.id,
				},
				include: [
					{
						model: StoreModel,
						attributes: ["id", "name"],
						where: { substance_id: stocktaking.substance_id },
						include: [
							{
								model: SubstanceModel,
								attributes: ["id", "name"],
							},
						],
					},
				],
				raw: true,
			});
			stores.forEach((el) => {
				el.name = `${el["store.name"]}-${el["store.substance.name"]}`;
			});
			const members = await StocktakingMembersModel.findAll({
				where: {
					stocktaking_id: stocktaking.id,
				},
				raw: true,
			});
			res.status(200).json({
				state: "success",
				data: {
					stores,
					stocktaking,
					members,
					dispensers,
				},
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getOverview = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const MovmentModel = getModel(req.year, "movment");
			const StationModel = getModel(req.year, "station");
			const SubstanceModel = getModel(req.year, "substance");
			const TankModel = getModel(req.year, "tank");
			const StoreModel = getModel(req.year, "store");
			const MovmentsShiftsModel = getModel(req.year, "movments_shift");
			const StoreMovmentModel = getModel(req.year, "store_movment");
			const StocktakingStoresMovmentsModel = getModel(
				req.year,
				"stocktaking_stores_movments",
			);
			const latestMovements = await MovmentModel.findAll({
				where: {
					station_id: {
						[Sequelize.Op.in]: req.stations,
					},
					state: "approved",
				},
				attributes: [
					"station_id",
					[fn("MAX", col("date")), "max_date"], // Get the maximum date for each station_id
				],
				group: ["station_id"], // Group by station_id to get one record per station_id
				raw: true,
			});

			const tanks = await TankModel.findAll({
				where: {
					station_id: {
						[Sequelize.Op.in]: req.stations,
					},
				},
				raw: true,
			});
			const latestMovementDetails = await Promise.all(
				latestMovements.map(async (movement) => {
					// Fetch the full record of the latest movement by station_id and date
					return MovmentModel.findOne({
						where: {
							station_id: movement.station_id,
							date: movement["max_date"],
						},
						include: [
							{
								model: StationModel,
								attributes: ["name", "number", "province"],
							},
						],
						raw: true,
					});
				}),
			);

			const latestStoresMovments = await Promise.all(
				latestMovementDetails.map(async (movement) => {
					const lastShift = await MovmentsShiftsModel.findOne({
						where: {
							movment_id: movement.id,
							number: movement.shifts,
						},
						raw: true,
					});
					// Fetch the full record of the latest movement by station_id and date
					if (!movement.has_stocktaking) {
						return StoreMovmentModel.findAll({
							where: {
								movment_id: movement.id,
								shift_id: lastShift.id,
							},
							include: [
								{
									model: StoreModel,
									attributes: ["name"],
									include: [{ model: SubstanceModel, attributes: ["name"] }],
								},
							],
							raw: true,
						});
					} else {
						return StocktakingStoresMovmentsModel.findAll({
							where: {
								stocktaking_id: movement.stocktaking_id,
							},
							include: [
								{
									model: StoreModel,
									attributes: ["name"],
									include: [{ model: SubstanceModel, attributes: ["name"] }],
								},
							],
							raw: true,
						});
					}
				}),
			);
			const now = new Date();
			latestMovementDetails.forEach((el) => {
				el.stores = latestStoresMovments
					.flat()
					.filter((ele) => ele.movment_id === el.id);
				el.tanks = tanks.filter((ele) => ele.station_id === el.station_id);
				const movementDate = new Date(el.date);

				const diffTime = Math.abs(now - movementDate);
				const diffDays = diffTime / (1000 * 60 * 60 * 24);

				el.isUpToDate = diffDays <= 2;
			});
			let provinceData = {};
			let provinceArray = [];
			if (req.query.groupBy === "1") {
				latestMovementDetails.forEach((station) => {
					const province = station["station.province"];

					if (!provinceData[province]) {
						provinceData[province] = {
							stations: [],
							substances: {},
						};
					}

					provinceData[province].stations.push({
						id: station.id,
						name: station["station.name"],
						number: station["station.number"],
						date: station.date,
						isUpToDate: station.isUpToDate,
					});

					station.stores.forEach((store) => {
						const substanceId = store["store.substance.id"];
						const substanceName = store["store.substance.name"];
						const currValue = store["curr_value"] || 0;
						const deficit = store["deficit"] || 0;
						const realValue = currValue - deficit;

						if (!provinceData[province].substances[substanceId]) {
							provinceData[province].substances[substanceId] = {
								substance_name: substanceName,
								total_curr_value: 0,
								total_real_value: 0,
							};
						}

						provinceData[province].substances[substanceId].total_curr_value +=
							currValue;
						provinceData[province].substances[substanceId].total_real_value +=
							realValue;
					});
				});

				// Convert to final array format
				provinceArray = Object.entries(provinceData).map(
					([province, data]) => ({
						province,
						stations: data.stations,
						substances: Object.entries(data.substances).map(
							([
								substanceId,
								{ substance_name, total_curr_value, total_real_value },
							]) => ({
								substance_id: substanceId,
								substance_name,
								total_curr_value,
								total_real_value, // <-- Add this line for the real value
							}),
						),
					}),
				);
			} else {
				latestMovementDetails.sort((a, b) => {
					return a["station.number"] - b["station.number"];
				});
				latestMovementDetails.forEach((station) => {
					if (station.has_stocktaking) {
						station.stores.forEach((store) => {
							store.deficit = store.prev_value - store.curr_value;
							store.curr_value = store.prev_value;
						});
					}
				});
			}

			res.status(200).json({
				state: "success",
				stations:
					req.query.groupBy === "1" ? provinceArray : latestMovementDetails,
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getCreditSalesReport = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const MovmentModel = getModel(req.year, "movment");
			const StationModel = getModel(req.year, "station");
			const CreditSaleModel = getModel(req.year, "credit_sale");
			const ClientModel = getModel(req.year, "client");
			const CreditSaleSettlementModel = getModel(
				req.year,
				"credit_sale_settlement",
			);

			// Parse stations array from query
			const stationIds = req.query.stations.split(",").map(Number);
			const clientsIds = req.query.clients.split(",").map(Number);
			const reportEndDate = new Date(req.query.endDate); // تجهيز تاريخ نهاية التقرير للمقارنة

			// Get all stations
			const stations = await StationModel.findAll({
				where: {
					id: { [Op.in]: stationIds },
				},
				raw: true,
				order: [["number", "ASC"]],
				transaction: t,
			});

			// Get all movements for all stations in date range
			const movments = await MovmentModel.findAll({
				where: {
					station_id: { [Op.in]: stationIds },
					date: {
						[Op.between]: [req.query.startDate, req.query.endDate],
					},
				},
				raw: true,
				transaction: t,
			});
			const movmentsIds = movments.map((el) => el.id);

			// Get all credit sales for all stations
			const creditSales = await CreditSaleModel.findAll({
				where: {
					station_id: { [Op.in]: stationIds },
					movment_id: { [Op.in]: movmentsIds },
					client_id: { [Op.in]: clientsIds },
				},
				attributes: [
					"id",
					"station_id",
					"client_id",
					"amount",
					"price",
					"title",
					"isSettled",
				],
				include: [
					{
						model: MovmentModel,
						attributes: ["date"],
					},
					{
						model: CreditSaleSettlementModel,
						attributes: ["date"], // تعديل 1: جلب تاريخ السداد
					},
					{
						model: ClientModel,
						attributes: ["name"],
					},
				],
				transaction: t,
				raw: true,
			});

			// Group by station, then by client
			const result = stations
				.map((station) => {
					const stationCreditSales = creditSales.filter(
						(cs) => cs.station_id === station.id,
					);

					// Group by client
					const clientsMap = {};
					stationCreditSales.forEach((cs) => {
						const clientId = cs.client_id;
						const value = +cs.amount * +cs.price;
						const amount = +cs.amount;

						// تعديل 2: حساب حالة السداد ديناميكياً
						// يعتمد الاسم "credit_sales_settlement.date" على الاسم الذي يعطيه Sequelize بناءً على تعريف المودل
						// إذا واجهت مشكلة في قراءة التاريخ، يمكنك طباعة `console.log(cs)` للتأكد من اسم المفتاح (key) الصحيح
						const settlementDateStr = cs["credit_sales_settlement.date"] || cs["credit_sales_settlements.date"];
						let isSettled = false;

						if (+cs.isSettled) {
							if (settlementDateStr) {
								const settlementDate = new Date(settlementDateStr);
								// إذا كان تاريخ السداد أصغر من أو يساوي تاريخ نهاية التقرير
								if (settlementDate <= reportEndDate) {
									isSettled = true;
								}
							} else {
								// في حال كانت مسددة ولكن لا يوجد لها تاريخ سداد مسجل (fallback)
								isSettled = true;
							}
						}

						if (!clientsMap[clientId]) {
							clientsMap[clientId] = {
								client_id: clientId,
								client_name: cs["client.name"],
								creditSales: [],
								total_amount: 0,
								total_value: 0,
								settled_amount: 0,
								settled_value: 0,
								unsettled_amount: 0,
								unsettled_value: 0,
							};
						}

						clientsMap[clientId].creditSales.push({
							id: cs.id,
							date: cs["movment.date"],
							amount: amount,
							price: +cs.price,
							value: value,
							title: cs.title,
							isSettled: isSettled ? 1 : 0, // نمرر الحالة الديناميكية
						});

						clientsMap[clientId].total_amount += amount;
						clientsMap[clientId].total_value += value;

						if (isSettled) {
							clientsMap[clientId].settled_amount += amount;
							clientsMap[clientId].settled_value += value;
						} else {
							clientsMap[clientId].unsettled_amount += amount;
							clientsMap[clientId].unsettled_value += value;
						}
					});

					// Sort credit sales by date within each client
					Object.values(clientsMap).forEach((client) => {
						client.creditSales.sort(
							(a, b) => new Date(a.date) - new Date(b.date),
						);
					});

					const clients = Object.values(clientsMap);

					return {
						station_id: station.id,
						station_name: station.name,
						clients: clients,
						total_credit_sales: stationCreditSales.length,
						total_amount: clients.reduce(
							(sum, client) => sum + client.total_amount,
							0,
						),
						total_value: clients.reduce(
							(sum, client) => sum + client.total_value,
							0,
						),
						settled_amount: clients.reduce(
							(sum, client) => sum + client.settled_amount,
							0,
						),
						settled_value: clients.reduce(
							(sum, client) => sum + client.settled_value,
							0,
						),
						unsettled_amount: clients.reduce(
							(sum, client) => sum + client.unsettled_amount,
							0,
						),
						unsettled_value: clients.reduce(
							(sum, client) => sum + client.unsettled_value,
							0,
						),
					};
				})
				.filter((station) => station.clients.length > 0);

			res.status(200).json({
				state: "success",
				data: {
					info: {
						startDate: req.query.startDate,
						endDate: req.query.endDate,
					},
					stations: result,
				},
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getAnnualIncomes = catchAsync(async (req, res, next) => {
	try {
		const StoreModel = getModel(req.year, "store");
		const SubstanceModel = getModel(req.year, "substance");
		const IncomeModel = getModel(req.year, "income");
		const SurplusModel = getModel(req.year, "surplus");
		const CalibrationModel = getModel(req.year, "calibration");
		const stores = await StoreModel.findAll({
			where: {
				station_id: req.params.station_id,
				// type: "نقدي",
			},
		});
		const incomes = await IncomeModel.findAll({
			attributes: [
				[col("store.substance.id"), "substanceId"],
				[fn("SUM", col("doc_amount")), "total"],
			],
			where: {
				store_id: {
					[Op.in]: stores.map((el) => el.id),
				},
			},
			include: [
				{
					model: StoreModel,
					attributes: [],
					include: [
						{
							model: SubstanceModel,
							attributes: ["id"],
						},
					],
				},
			],
			group: ["store.substance.id"],
			raw: true,
		});
		const surpleses = await SurplusModel.findAll({
			where: {
				station_id: req.params.station_id,
				is_annual_stocktaking: 1,
			},
			attributes: [
				[col("store.substance.id"), "substanceId"],
				[fn("SUM", col("amount")), "total"],
			],
			where: {
				store_id: {
					[Op.in]: stores.map((el) => el.id),
				},
			},
			include: [
				{
					model: StoreModel,
					attributes: [],
					include: [
						{
							model: SubstanceModel,
							attributes: ["id"],
						},
					],
				},
			],
			group: ["store.substance.id"],
			raw: true,
		});
		const calibrations = await CalibrationModel.findAll({
			attributes: [
				[col("store.substance.id"), "substanceId"],
				[fn("SUM", col("amount")), "total"],
			],
			where: {
				store_id: {
					[Op.in]: stores.map((el) => el.id),
				},
			},
			include: [
				{
					model: StoreModel,
					attributes: [],
					include: [
						{
							model: SubstanceModel,
							attributes: ["id"],
						},
					],
				},
			],
			group: ["store.substance.id"],
			raw: true,
		});
		const all = [...incomes, ...surpleses, ...calibrations];
		const sums = all.reduce((acc, { substanceId, total }) => {
			// Convert to number in case it's a string
			const value = Number(total);
			if (!acc[substanceId]) acc[substanceId] = 0;
			acc[substanceId] += value;
			return acc;
		}, {});
		const result = Object.entries(sums).map(([substanceId, total]) => ({
			substanceId: Number(substanceId),
			total,
		}));

		res.status(200).json({
			state: "success",
			result,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getAnnualStoresMovment = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const StoreModel = getModel(req.year, "store");
			const SubstanceModel = getModel(req.year, "substance");
			const StoreMovmentModel = getModel(req.year, "store_movment");
			const QuantityDeductionModel = getModel(req.year, "quantity_deduction");
			const MovmentsShiftsModel = getModel(req.year, "movments_shift");
			const StocktakingModel = getModel(req.year, "stocktaking");
			const StocktakingStoresMovmentsModel = getModel(
				req.year,
				"stocktaking_stores_movments",
			);
			const MovmentModel = getModel(req.year, "movment");
			const minMovment = await MovmentModel.findOne({
				where: {
					station_id: req.params.station_id,
					date: "2025-01-01",
				},
				raw: true,
				transaction: t,
			});
			const maxMovment = await MovmentModel.findOne({
				where: {
					station_id: req.params.station_id,
					date: "2025-11-23",
				},
				raw: true,
				transaction: t,
			});

			const minShift = await MovmentsShiftsModel.findOne({
				where: {
					movment_id: minMovment.id,
					number: 1,
				},
				raw: true,
				transaction: t,
			});
			const maxShift = await MovmentsShiftsModel.findOne({
				where: {
					movment_id: maxMovment.id,
					number: maxMovment.shifts,
				},
				raw: true,
				transaction: t,
			});
			const minSubstanceMovment = await StoreMovmentModel.findAll({
				where: {
					station_id: req.params.station_id,
					shift_id: minShift.id,
				},
				attributes: [
					[col("store.substance.id"), "substanceId"],
					[fn("SUM", col("prev_value")), "prev_value"],
				],
				include: [
					{
						model: StoreModel,
						attributes: [],
						include: [
							{
								model: SubstanceModel,
								attributes: [], // or ['id', 'name'] if you also want them in SELECT
							},
						],
					},
				],
				group: ["store.substance.id"],
				raw: true,
			});
			const maxSubstanceMovment = await StoreMovmentModel.findAll({
				where: {
					station_id: req.params.station_id,
					shift_id: maxShift.id,
				},
				attributes: [
					[col("store.substance.id"), "substanceId"],
					[fn("SUM", col("curr_value")), "curr_value"],
				],
				include: [
					{
						model: StoreModel,
						attributes: [],
						include: [
							{
								model: SubstanceModel,
								attributes: [],
							},
						],
					},
				],
				group: ["store.substance.id"],
				raw: true,
			});

			const quantityDeduction = await QuantityDeductionModel.findAll({
				where: {
					movment_id: maxMovment.id,
					is_annual_stocktaking: 0,
				},
				transaction: t,
				raw: true,
			});

			const stocktaking = await StocktakingModel.findAll({
				where: {
					movment_id: maxMovment.id,
				},
				transaction: t,
				raw: true,
			});
			if (quantityDeduction.length > 0) {
				maxSubstanceMovment.forEach((el) => {
					const deduction = quantityDeduction.filter(
						(ele) => ele.substance_id === el.substanceId,
					)[0];
					const amount = +deduction?.amount || 0;
					el.curr_value = +el.curr_value - amount;
				});
			}
			if (stocktaking.length > 0) {
				const stocktakingStoresMovments =
					await StocktakingStoresMovmentsModel.findAll({
						where: {
							stocktaking_id: stocktaking.id,
						},
						include: [
							{
								model: StoreModel,
								attributes: [],
								include: [
									{
										model: SubstanceModel,
										attributes: ["id"],
									},
								],
							},
						],
						transaction: t,
						raw: true,
					});
				maxSubstanceMovment.forEach((el) => {
					const stocktakingData = stocktakingStoresMovments.filter(
						(ele) => ele.substance_id === el["store.substance.id"],
					)[0];
					const amount =
						+stocktakingData?.curr_value ||
						0 - +stocktakingData?.prev_value ||
						0;
					if (amount > 0) {
						el.curr_value = el.curr_value + +amount;
					}
				});
			}
			res.status(200).json({
				state: "success",
				minSubstanceMovment,
				maxSubstanceMovment,
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});

exports.getAnnualStocktakingReport = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const AnnualStocktakingModel = getModel(req.year, "annual_stocktaking");
			const AnnualStocktakingMemberModel = getModel(
				req.year,
				"annual_stocktaking_member",
			);
			const AnnualStocktakingCashModel = getModel(
				req.year,
				"annual_stocktaking_cash",
			);
			const AnnualStocktakingTankModel = getModel(
				req.year,
				"annual_stocktaking_tank",
			);
			const AnnualStocktakingSurplusDeficitModel = getModel(
				req.year,
				"annual_stocktaking_surplus_deficit",
			);
			const StationModel = getModel(req.year, "station");
			const TankModel = getModel(req.year, "tank");
			const SubstanceModel = getModel(req.year, "substance");
			const MovmentModel = getModel(req.year, "movment");
			const DispenserModel = getModel(req.year, "dispenser");
			const DepositModel = getModel(req.year, "deposit");
			const DispenserMovmentModel = getModel(req.year, "dispenser_movment");
			const StoreModel = getModel(req.year, "store");
			const StoreMovmentModel = getModel(req.year, "store_movment");
			const IncomeModel = getModel(req.year, "income");
			const OtherModel = getModel(req.year, "other");
			const QuantityDeductionModel = getModel(req.year, "quantity_deduction");
			const CalibrationModel = getModel(req.year, "calibration");

			const CreditSaleModel = getModel(req.year, "credit_sale");

			// Get the annual stocktaking record
			const annualStocktaking = await AnnualStocktakingModel.findOne({
				where: {
					id: req.params.id,
				},
				include: [
					{
						model: StationModel,
						attributes: ["id", "name", "supervisor"],
					},
				],
				transaction: t,
			});

			if (!annualStocktaking) {
				return next(new AppError("Annual stocktaking not found", 404));
			}
			const income = await IncomeModel.findOne({
				where: {
					id: annualStocktaking.last_income_id,
				},
				include: [
					{
						model: MovmentModel,
						attributes: ["date"],
					},
				],
				transaction: t,
			});
			const deposit = await DepositModel.findOne({
				where: {
					id: annualStocktaking.last_deposit_id,
				},
				transaction: t,
			});
			const movment = await MovmentModel.findOne({
				where: {
					id: annualStocktaking.last_movment_id,
				},
				transaction: t,
			});
			// Get members
			const members = await AnnualStocktakingMemberModel.findAll({
				where: {
					annual_stocktaking_id: req.params.id,
				},
				transaction: t,
				raw: true,
			});

			const groupedMembers = [];
			const membersSigns = [];
			for (let i = 0; i < members.length; i += 3) {
				const group = {
					name_1: members[i]?.name || "",
					name_2: members[i + 1]?.name || "",
					name_3: members[i + 2]?.name || "",
					title_1: members[i]?.title || "",
					title_2: members[i + 1]?.title || "",
					title_3: members[i + 2]?.title || "",
					pre_1: members[i]?.name ? "الأخ" : "",
					pre_2: members[i + 1]?.name ? "الأخ" : "",
					pre_3: members[i + 2]?.name ? "الأخ" : "",
				};
				groupedMembers.push(group);
			}
			for (let i = 0; i < members.length; i += 2) {
				const group = {
					name_1: members[i]?.name || "",
					name_2: members[i + 1]?.name || "",
					pre_1: members[i]?.name ? "الأخ" : "",
					pre_2: members[i + 1]?.name ? "الأخ" : "",
					sub_1: members[i]?.name ? "التوقيع ................" : "",
					sub_2: members[i + 1]?.name ? "التوقيع ................" : "",
				};
				membersSigns.push(group);
			}
			// Get cash
			const cash = await AnnualStocktakingCashModel.findOne({
				where: {
					annual_stocktaking_id: req.params.id,
				},
				transaction: t,
				raw: true,
			});

			// Get tanks
			const tanks = await AnnualStocktakingTankModel.findAll({
				where: {
					annual_stocktaking_id: req.params.id,
				},
				include: [
					{
						model: TankModel,
						attributes: ["number", "capacity"],
						include: [
							{
								model: SubstanceModel,
								attributes: ["id", "name"],
							},
						],
					},
				],
				transaction: t,
				raw: true,
			});

			// Get surplus/deficit
			const SurplusModel = getModel(req.year, "surplus");
			const surplusDeficit = await AnnualStocktakingSurplusDeficitModel.findAll(
				{
					where: {
						annual_stocktaking_id: req.params.id,
					},
					transaction: t,
					raw: true,
				},
			);

			// Get surplus and deficit details based on surplus_id and deficit_id
			const surplusIds = surplusDeficit
				.map((sd) => sd.surplus_id)
				.filter((id) => id);
			const deficitIds = surplusDeficit
				.map((sd) => sd.deficit_id)
				.filter((id) => id);

			const surplusDataRaw = await SurplusModel.findAll({
				where: {
					id: { [Op.in]: surplusIds },
				},
				include: [
					{
						model: StoreModel,
						attributes: ["id", "name"],
						include: [
							{
								model: SubstanceModel,
								attributes: ["id", "name"],
							},
						],
					},
				],
				transaction: t,
				raw: true,
			});

			const deficitDataRaw = await QuantityDeductionModel.findAll({
				where: {
					id: { [Op.in]: deficitIds },
				},
				include: [
					{
						model: StoreModel,
						attributes: ["id", "name"],
						include: [
							{
								model: SubstanceModel,
								attributes: ["id", "name"],
							},
						],
					},
				],
				transaction: t,
				raw: true,
			});

			// Add store field combining store_name and substance_name
			const surplusData = surplusDataRaw.map((item) => ({
				...item,
				store: `${item["store.name"]} - ${item["store.substance.name"]}`,
			}));

			const deficitData = deficitDataRaw.map((item) => ({
				...item,
				store: `${item["store.name"]} - ${item["store.substance.name"]}`,
			}));

			// Calculate cash total
			const cashDenominations = [
				{ denomination: 1000, title: "فئة ألف ريال" },
				{ denomination: 500, title: "فئة خمسمائة ريال" },
				{ denomination: 200, title: "فئة مائتين ريال" },
				{ denomination: 100, title: "فئة مائة ريال" },
				{ denomination: 50, title: "فئة خمسين ريال" },
				{ denomination: 20, title: "فئة عشرين ريال" },
				{ denomination: 10, title: "فئة عشرة ريال" },
				{ denomination: 5, title: "فئة خمسة ريال" },
				{ denomination: 1, title: "فئة ريال" },
				{ denomination: 0, title: "عملة برونزية" },
			];
			let cashTotal = 0;
			const cashDetails = cashDenominations.map((item) => {
				const count = cash ? cash[item.denomination] || 0 : 0;
				const value = count * item.denomination;
				cashTotal += value;
				return {
					denomination: item.denomination,
					title: item.title,
					count: count,
					value: value,
				};
			});

			// Group tanks by substance
			const groupedTanks = tanks.reduce((acc, item) => {
				const substanceName = item["tank.substance.name"];
				const existingGroup = acc.find(
					(group) => group.substance === substanceName,
				);

				if (existingGroup) {
					existingGroup.data.push(item);
					existingGroup.total_liter += +item.height_in_liter;
				} else {
					acc.push({
						substance: substanceName,
						substance_id: item["tank.substance.id"],
						data: [item],
						total_liter: +item.height_in_liter,
					});
				}

				return acc;
			}, []);

			// Calculate substancesData (stores movement summary)
			// Get all stores for the station
			const stores = await StoreModel.findAll({
				where: {
					station_id: annualStocktaking.station_id,
				},
				include: [
					{
						model: SubstanceModel,
						attributes: ["id", "name"],
					},
				],
				raw: true,
				transaction: t,
			});
			const storesIds = stores.map((el) => el.id);

			// Calculate annual dispensers movement
			const movments = await MovmentModel.findAll({
				where: {
					station_id: annualStocktaking.station_id,
					date: {
						[Op.between]: [`${req.year}-01-01`, `${req.year}-12-31`],
					},
				},
				raw: true,
				transaction: t,
			});
			const movmentsIds = movments.map((el) => el.id);

			// Get store movements
			const storesMovmentsRaw = await StoreMovmentModel.findAll({
				where: {
					movment_id: {
						[Op.in]: movmentsIds,
					},
					store_id: {
						[Op.in]: storesIds,
					},
				},
				raw: true,
				include: [
					{
						model: StoreModel,
						attributes: ["id", "name", "type"],
						include: [
							{
								model: SubstanceModel,
								attributes: ["id", "name"],
							},
						],
					},
				],
				transaction: t,
			});

			// Group store movements by store_id
			const groupedStoresById = storesMovmentsRaw.reduce((acc, item) => {
				const existingGroup = acc.find(
					(group) => group.store_id === item.store_id,
				);
				if (existingGroup) {
					existingGroup.data.push(item);
				} else {
					acc.push({
						store_id: item.store_id,
						data: [item],
					});
				}
				return acc;
			}, []);

			// Get incomes
			const incomes = await IncomeModel.findAll({
				where: {
					station_id: annualStocktaking.station_id,
					store_id: { [Op.in]: storesIds },
					movment_id: { [Op.in]: movmentsIds },
				},
				include: [
					{
						model: StoreModel,
						attributes: ["id", "name", "type"],
						where: {
							type: "نقدي",
						},
						include: [
							{
								model: SubstanceModel,
								attributes: ["id", "name"],
							},
						],
					},
				],
				attributes: [
					"store_id",
					[req.db.fn("SUM", req.db.col("amount")), "total_amount"],
				],
				group: ["store_id"],
				raw: true,
				transaction: t,
			});
			const otherIncomes = await IncomeModel.findAll({
				where: {
					station_id: annualStocktaking.station_id,
					store_id: { [Op.in]: storesIds },
					movment_id: { [Op.in]: movmentsIds },
				},
				include: [
					{
						model: StoreModel,
						attributes: ["id", "name", "type"],
						where: {
							type: "مجنب",
						},
						include: [
							{
								model: SubstanceModel,
								attributes: ["id", "name"],
							},
						],
					},
				],
				attributes: [
					"store_id",
					[req.db.fn("SUM", req.db.col("amount")), "total_amount"],
				],
				group: ["store_id"],
				raw: true,
				transaction: t,
			});

			//get surpluses
			const surpluses = await SurplusModel.findAll({
				where: {
					station_id: annualStocktaking.station_id,
					store_id: { [Op.in]: storesIds },
					is_annual_stocktaking: 0,
				},
				attributes: [
					"store_id",
					[req.db.fn("SUM", req.db.col("amount")), "total_amount"],
				],
				group: ["store_id"],
				raw: true,
				transaction: t,
			});
			//get calibrations
			const calibrations = await CalibrationModel.findAll({
				where: {
					station_id: annualStocktaking.station_id,
					store_id: { [Op.in]: storesIds },
				},
				attributes: [
					"store_id",
					[req.db.fn("SUM", req.db.col("amount")), "total_amount"],
				],
				group: ["store_id"],
				raw: true,
				transaction: t,
			});
			//get deficits
			const deficits = await QuantityDeductionModel.findAll({
				where: {
					station_id: annualStocktaking.station_id,
					store_id: { [Op.in]: storesIds },
					is_annual_stocktaking: 0,
				},
				attributes: [
					"substance_id",
					[req.db.fn("SUM", req.db.col("amount")), "total_amount"],
				],
				group: ["substance_id"],
				raw: true,
				transaction: t,
			});
			incomes.forEach((el) => {
				const surplus = surpluses.find(
					(ele) => ele.store_id === el.store_id,
				)?.total_amount;
				const calibration = calibrations.find(
					(ele) => ele.store_id === el.store_id,
				)?.total_amount;
				el.total_amount =
					+el.total_amount + (+surplus || 0) + (+calibration || 0);
			});
			// Get others
			const others = await OtherModel.findAll({
				where: {
					station_id: annualStocktaking.station_id,
					store_id: { [Op.in]: storesIds },
					movment_id: { [Op.in]: movmentsIds },
				},
				attributes: [
					"store_id",
					[req.db.fn("SUM", req.db.col("amount")), "total_amount"],
				],
				group: ["store_id"],
				raw: true,
				transaction: t,
			});

			// Get credit sales
			const creditSales = await CreditSaleModel.findAll({
				where: {
					station_id: annualStocktaking.station_id,
					store_id: { [Op.in]: storesIds },
					movment_id: { [Op.in]: movmentsIds },
				},
				attributes: [
					"store_id",
					[req.db.fn("SUM", req.db.col("amount")), "total_amount"],
				],
				group: ["store_id"],
				raw: true,
				transaction: t,
			});

			// Calculate stores movement arr with prev/curr values
			const storesMovmentsArr = groupedStoresById.map((group) => {
				const dates = group.data.map((item) => {
					const date = movments.filter((ele) => ele.id === item.movment_id)[0]
						?.date;
					return new Date(date);
				});
				const minDate = new Date(Math.min(...dates));
				const maxDate = new Date(Math.max(...dates));

				const minDateData = group.data.find((item) => {
					const date = movments.filter((ele) => ele.id === item.movment_id)[0]
						?.date;
					return new Date(date).getTime() === minDate.getTime();
				});

				const maxDateData = group.data.find((item) => {
					const date = movments.filter((ele) => ele.id === item.movment_id)[0]
						?.date;
					return new Date(date).getTime() === maxDate.getTime();
				});

				const incomeAmount =
					incomes.find((el) => el.store_id === group.store_id)?.total_amount ||
					0;
				const otherIncomesAmount =
					otherIncomes.find((el) => el.store_id === group.store_id)
						?.total_amount || 0;
				const othersAmount =
					others.find((el) => el.store_id === group.store_id)?.total_amount ||
					0;
				const creditSalesAmount =
					creditSales.find((el) => el.store_id === group.store_id)
						?.total_amount || 0;

				return {
					store_id: group.store_id,
					substance_id: maxDateData["store.substance.id"],
					substance_name: maxDateData["store.substance.name"],
					store_type: maxDateData["store.type"],
					prev_value: +minDateData?.prev_value || 0,
					curr_value: +maxDateData?.curr_value || 0,
					income: +incomeAmount,
					otherIncomes: +otherIncomesAmount,
					others: +othersAmount,
					creditSales: +creditSalesAmount,
					totalSpend:
						+minDateData?.prev_value +
						+incomeAmount +
						+otherIncomesAmount -
						+maxDateData?.curr_value,
				};
			});

			// Calculate sums by substance
			const sumBySubstance = storesMovmentsArr.reduce((acc, item) => {
				const existing = acc.find(
					(el) => el.substance_id === item.substance_id,
				);
				if (existing) {
					existing.income += item.income;
					existing.otherIncomes += item.otherIncomes;
					existing.prev_value += item.prev_value;
					existing.curr_value += item.curr_value;
					existing.total_spend += item.totalSpend;
				} else {
					acc.push({
						substance_id: item.substance_id,
						income: item.income,
						otherIncomes: item.otherIncomes,
						prev_value: item.prev_value,
						curr_value: item.curr_value,
						total_spend: item.totalSpend,
					});
				}
				return acc;
			}, []);

			// Calculate sums by substance and store type
			const sumBySubstanceAndType = storesMovmentsArr.reduce((acc, item) => {
				const existing = acc.find(
					(el) =>
						el.substance_id === item.substance_id &&
						el.store_type === item.store_type,
				);
				if (existing) {
					existing.totalSpend += item.totalSpend;
				} else {
					acc.push({
						substance_id: item.substance_id,
						store_type: item.store_type,
						totalSpend: item.totalSpend,
					});
				}
				return acc;
			}, []);

			// Get all substances
			const allSubstances = await SubstanceModel.findAll({
				raw: true,
				transaction: t,
			});
			// Build substancesData array
			const substancesData = allSubstances
				.map((substance) => {
					const calibration =
						calibrations.find((ele) => ele.store_id === substance.id)
							?.total_amount || 0;
					const deficitAmount =
						deficits.find((ele) => ele.substance_id === substance.id)
							?.total_amount || 0;

					const prev_value =
						sumBySubstance.find((el) => el.substance_id === substance.id)
							?.prev_value || 0;
					const curr_value =
						sumBySubstance.find((el) => el.substance_id === substance.id)
							?.curr_value || 0;
					const income =
						sumBySubstance.find((el) => el.substance_id === substance.id)
							?.income || 0;
					const otherIncomes =
						sumBySubstance.find((el) => el.substance_id === substance.id)
							?.otherIncomes || 0;
					const totalCashSpend =
						(sumBySubstanceAndType.find(
							(el) =>
								el.substance_id === substance.id && el.store_type === "نقدي",
						)?.totalSpend || 0 - calibration) - +deficitAmount;

					const totalOthersSpend =
						(sumBySubstanceAndType.find(
							(el) =>
								el.substance_id === substance.id && el.store_type === "مجنب",
						)?.totalSpend || 0) + +deficitAmount;

					// Get tanks total for this substance
					const substanceTanks = groupedTanks.find(
						(el) => el.substance_id === substance.id,
					);
					const tanksTotalAmount = substanceTanks?.total_liter || 0;

					const deficit = +tanksTotalAmount - curr_value;

					// Calculate final values based on deficit
					let finalIncome = 0;
					let finalSpent = 0;
					if (deficit > 0) {
						finalIncome = deficit + income + prev_value + otherIncomes;
						finalSpent = totalCashSpend + totalOthersSpend;
					} else if (deficit < 0) {
						const deficitAmount = Math.abs(deficit) || 0;
						finalIncome = income + otherIncomes + prev_value;
						finalSpent = totalCashSpend + totalOthersSpend + deficitAmount;
					} else {
						finalIncome = income + otherIncomes + prev_value;
						finalSpent = totalCashSpend + totalOthersSpend;
					}

					// Get tanks data for this substance from groupedTanks
					const substanceTanksData = groupedTanks.find(
						(el) => el.substance_id === substance.id,
					);

					const storesMovment = [
						{
							num: 1,
							title: "رصيد أول المدة",
							income: +prev_value,
							spent: 0,
						},
						{
							num: 2,
							title: "الوارد مشتريات",
							income: +income,
							spent: 0,
						},
						{
							num: 3,
							title: "ج  المبيعات العام",
							income: 0,
							spent: +totalCashSpend,
						},
						{
							num: 4,
							title: "أخرى",
							income: +otherIncomes,
							spent: +totalOthersSpend,
						},
						{
							num: 5,
							title: "العجز/الفائض",
							income: deficit > 0 ? deficit : 0,
							spent: deficit < 0 ? Math.abs(deficit) : 0,
						},
						{
							num: 6,
							title: "الاجمالي",
							income: finalIncome,
							spent: finalSpent,
						},
						{
							num: 8,
							title: "الرصيد",
							income: finalIncome - finalSpent,
							spent: 0,
						},
					];

					// Check if all income and spent values are 0
					const hasData = storesMovment.some(
						(item) => item.income !== 0 || item.spent !== 0,
					);

					if (!hasData) return null;

					return {
						substance_id: substance.id,
						name: substance.name,
						tanks: substanceTanksData?.data || [],
						tanks_total_liter: substanceTanksData?.total_liter || 0,
						storesMovment,
					};
				})
				.filter((item) => item !== null);

			// Build substancesSummary array with curr_value, tanks value, surplus/deficit
			const substancesSummary = allSubstances.map((substance) => {
				const curr_value =
					sumBySubstance.find((el) => el.substance_id === substance.id)
						?.curr_value || 0;

				// Get tanks total for this substance (check by substance_id)
				const substanceTanks = groupedTanks.find(
					(el) => +el.substance_id === +substance.id,
				);
				const tanks_value = substanceTanks?.total_liter || 0;
				// Get surplus/deficit for this substance
				const substanceSurplusDeficit = surplusDeficit.find(
					(el) => +el.substance_id === +substance.id,
				);

				const deficitAmount = +substanceSurplusDeficit?.deficit || 0;
				const surplusAmount = +substanceSurplusDeficit?.surplus || 0;
				const price = +substanceSurplusDeficit?.price || 0;

				return {
					substance_id: substance.id,
					substance_name: substance.name,
					curr_value: +curr_value,
					tanks_value: +tanks_value,
					deficit: deficitAmount,
					surplus: surplusAmount,
					deficit_value: deficitAmount * price,
					surplus_value: surplusAmount * price,
				};
			});

			const DispensersMovments = await DispenserMovmentModel.findAll({
				where: {
					station_id: annualStocktaking.station_id,
					movment_id: {
						[Op.in]: movmentsIds,
					},
				},
				raw: true,
				include: [
					{
						model: DispenserModel,
						attributes: ["id", "number"],
						include: [
							{
								model: TankModel,
								attributes: ["id"],
								include: [
									{
										model: SubstanceModel,
										attributes: ["id", "name"],
									},
								],
							},
						],
					},
				],
				order: [[{ model: DispenserModel }, "number", "ASC"]],
				transaction: t,
			});

			// Group dispensers by ID and calculate totals
			const groupedDispensersById = DispensersMovments.reduce((acc, item) => {
				const existingGroup = acc.find(
					(group) => group.dispenser_id === item.dispenser_id,
				);

				if (existingGroup) {
					existingGroup.data.push(item);
				} else {
					acc.push({
						dispenser_id: item.dispenser_id,
						data: [item],
					});
				}

				return acc;
			}, []);

			const dispensersMovments = groupedDispensersById.flatMap((group) => {
				const dates = group.data.map((item) => {
					const date = movments.filter((ele) => ele.id === item.movment_id)[0]
						.date;
					return new Date(date);
				});
				const minDate = new Date(Math.min(...dates));
				const maxDate = new Date(Math.max(...dates));

				const minDateData = group.data.find((item) => {
					const date = movments.filter((ele) => ele.id === item.movment_id)[0]
						.date;
					return new Date(date).getTime() === minDate.getTime();
				});

				const maxDateData = group.data.find((item) => {
					const date = movments.filter((ele) => ele.id === item.movment_id)[0]
						.date;
					return new Date(date).getTime() === maxDate.getTime();
				});

				const dispenserNumber = maxDateData["dispenser.number"];

				// Return separate entries for A and B
				return [
					{
						dispenser_id: maxDateData.dispenser_id,
						name: `${dispenserNumber}A`,
						dispenser_number: dispenserNumber,
						side: "A",
						prev: minDateData.prev_A,
						curr: maxDateData.curr_A,
						total: maxDateData.curr_A - minDateData.prev_A,
						min_date: minDate.toISOString().split("T")[0],
						max_date: maxDate.toISOString().split("T")[0],
						substance_id: maxDateData["dispenser.tank.substance.id"],
						substance_name: maxDateData["dispenser.tank.substance.name"],
					},
					{
						dispenser_id: maxDateData.dispenser_id,
						name: `${dispenserNumber}B`,
						dispenser_number: dispenserNumber,
						side: "B",
						prev: minDateData.prev_B,
						curr: maxDateData.curr_B,
						total: maxDateData.curr_B - minDateData.prev_B,
						min_date: minDate.toISOString().split("T")[0],
						max_date: maxDate.toISOString().split("T")[0],
						substance_id: maxDateData["dispenser.tank.substance.id"],
						substance_name: maxDateData["dispenser.tank.substance.name"],
					},
				];
			});

			// Group dispensers by substance
			const groupedDispensers = dispensersMovments.reduce((acc, item) => {
				const existingGroup = acc.find(
					(group) => group.substance_id === item.substance_id,
				);

				if (existingGroup) {
					existingGroup.data.push(item);
					existingGroup.total += item.total;
				} else {
					acc.push({
						substance: item.substance_name,
						substance_id: item.substance_id,
						data: [item],
						total: item.total,
					});
				}

				return acc;
			}, []);
			const nextDate = new Date(annualStocktaking.date);
			nextDate.setDate(nextDate.getDate() + 1);
			res.status(200).json({
				state: "success",
				data: {
					info: {
						id: annualStocktaking.id,
						station_id: annualStocktaking.station_id,
						station_name: annualStocktaking.station?.name,
						supervisor: annualStocktaking.station?.supervisor,
						date: annualStocktaking.date,
						next_date: nextDate.toISOString().split("T")[0],
						time: annualStocktaking.time,
						number: annualStocktaking.number,
						last_income_id: annualStocktaking.last_income_id,
						last_movment_id: movment.number,
						last_deposit_id: annualStocktaking.last_deposit_id,
						last_income_date: income.movment.date,
						last_movment_date: movment.date,
						last_deposit_date: deposit.invoice_date,
						day: annualStocktaking.day,
						year: new Date(annualStocktaking.date).getFullYear(),
						next_year: new Date(annualStocktaking.date).getFullYear() + 1,
						portfolio_number: annualStocktaking.portfolio_number,
						portfolio_date: annualStocktaking.portfolio_date,
					},
					members: groupedMembers,
					membersSigns,
					cash: {
						details: cashDetails,
						total: cashTotal,
					},
					surplus: surplusData,
					deficit: deficitData,
					dispensers: groupedDispensers,
					substancesData,
					substancesSummary,
				},
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});

exports.getFinancialBalanceReport = catchAsync(async (req, res, next) => {
	try {
		console.time("report");
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

		// Get all stations
		const stations = await StationModel.findAll({
			raw: true,
			order: [["number", "ASC"]],
		});

		const startDate = req.query.startDate;
		const endDate = req.query.endDate;

		// --- 1. Fetch Movements ---
		const [currentMovments, pastMovments] = await Promise.all([
			MovmentModel.findAll({ attributes: ["id", "station_id"], where: { date: { [Op.between]: [startDate, endDate] } }, raw: true }),
			MovmentModel.findAll({ attributes: ["id", "station_id"], where: { date: { [Op.lt]: startDate } }, raw: true })
		]);
		const currentMovmentsIds = currentMovments.map(m => m.id);
		const pastMovmentsIds = pastMovments.map(m => m.id);

		// --- 2. Bulk Fetch Current Period ---
		const [
			currentFinancialOps,
			currentIncomes,
			currentSurplus,
			currentDeposits,
			currentCreditSales,
			currentPriceMovments,
			currentQuantityDeductions
		] = await Promise.all([
			FinancialOperationsModel.findAll({ attributes: ["station_id", "debtor", "creditor"], where: { date: { [Op.between]: [startDate, endDate] } }, raw: true }),
			currentMovmentsIds.length ? IncomeModel.findAll({ attributes: ["station_id", "amount", "price"], where: { movment_id: { [Op.in]: currentMovmentsIds }, type: { [Op.in]: ["income", "initial"] } }, include: [{ model: StoreModel, attributes: [], where: { type: "نقدي" } }], raw: true }) : [],
			currentMovmentsIds.length ? SurplusModel.findAll({ attributes: ["station_id", "amount", "price"], where: { is_annual_stocktaking: 0, movment_id: { [Op.in]: currentMovmentsIds } }, include: [{ model: StoreModel, attributes: [], where: { type: "نقدي" } }], raw: true }) : [],
			DepositModel.findAll({ attributes: ["station_id", "amount"], where: { invoice_date: { [Op.between]: [startDate, endDate] } }, raw: true }),
			CreditSaleSettlementModel.findAll({ attributes: ["station_id", "amount"], where: { date: { [Op.between]: [startDate, endDate] }, type: "قيد مالي" }, raw: true }),
			priceMovmentEntriesModel.findAll({ attributes: ["station_id", "debtor", "creditor"], where: { date: { [Op.between]: [startDate, endDate] } }, raw: true }),
			QuantityDeductionModel.findAll({ attributes: ["station_id", "amount", "price"], where: { date: { [Op.between]: [startDate, endDate] }, with_value: { [Op.ne]: 0 } }, raw: true })
		]);

		// --- 3. Bulk Fetch Past Period (Opening Balance) ---
		const [
			pastFinancialOps,
			pastIncomes,
			pastSurplus,
			pastDeposits,
			pastCreditSales,
			pastPriceMovments,
			pastQuantityDeductions
		] = await Promise.all([
			FinancialOperationsModel.findAll({ attributes: ["station_id", "debtor", "creditor"], where: { date: { [Op.lt]: startDate } }, raw: true }),
			pastMovmentsIds.length ? IncomeModel.findAll({ attributes: ["station_id", "amount", "price"], where: { movment_id: { [Op.in]: pastMovmentsIds }, type: { [Op.in]: ["income", "initial"] } }, include: [{ model: StoreModel, attributes: [], where: { type: "نقدي" } }], raw: true }) : [],
			pastMovmentsIds.length ? SurplusModel.findAll({ attributes: ["station_id", "amount", "price"], where: { is_annual_stocktaking: 0, movment_id: { [Op.in]: pastMovmentsIds } }, include: [{ model: StoreModel, attributes: [], where: { type: "نقدي" } }], raw: true }) : [],
			DepositModel.findAll({ attributes: ["station_id", "amount"], where: { invoice_date: { [Op.lt]: startDate } }, raw: true }),
			CreditSaleSettlementModel.findAll({ attributes: ["station_id", "amount"], where: { date: { [Op.lt]: startDate }, type: "قيد مالي" }, raw: true }),
			priceMovmentEntriesModel.findAll({ attributes: ["station_id", "debtor", "creditor"], where: { date: { [Op.lt]: startDate } }, raw: true }),
			QuantityDeductionModel.findAll({ attributes: ["station_id", "amount", "price"], where: { date: { [Op.lt]: startDate }, with_value: { [Op.ne]: 0 } }, raw: true })
		]);

		// Helper function to group data by station_id
		const groupByStationId = (array) => {
			return array.reduce((acc, curr) => {
				const id = curr.station_id;
				if (!acc[id]) acc[id] = [];
				acc[id].push(curr);
				return acc;
			}, {});
		};

		// Group all fetched arrays
		const currentFinancialOpsByStation = groupByStationId(currentFinancialOps);
		const currentIncomesByStation = groupByStationId(currentIncomes);
		const currentSurplusByStation = groupByStationId(currentSurplus);
		const currentDepositsByStation = groupByStationId(currentDeposits);
		const currentCreditSalesByStation = groupByStationId(currentCreditSales);
		const currentPriceMovmentsByStation = groupByStationId(currentPriceMovments);
		const currentQuantityDeductionsByStation = groupByStationId(currentQuantityDeductions);

		const pastFinancialOpsByStation = groupByStationId(pastFinancialOps);
		const pastIncomesByStation = groupByStationId(pastIncomes);
		const pastSurplusByStation = groupByStationId(pastSurplus);
		const pastDepositsByStation = groupByStationId(pastDeposits);
		const pastCreditSalesByStation = groupByStationId(pastCreditSales);
		const pastPriceMovmentsByStation = groupByStationId(pastPriceMovments);
		const pastQuantityDeductionsByStation = groupByStationId(pastQuantityDeductions);

		const results = [];

		for (const station of stations) {
			console.time(`station-${station.id}`);
			const sId = station.id;

			// --- Current Period Calculations ---
			let perioddebtor = (currentFinancialOpsByStation[sId] || []).reduce((sum, el) => sum + (+el.debtor || 0), 0);
			let periodcreditor = (currentFinancialOpsByStation[sId] || []).reduce((sum, el) => sum + (+el.creditor || 0), 0);

			(currentIncomesByStation[sId] || []).forEach((el) => { perioddebtor += el.amount * el.price; });
			(currentSurplusByStation[sId] || []).forEach((el) => { perioddebtor += el.amount * el.price; });
			(currentDepositsByStation[sId] || []).forEach((el) => { periodcreditor += el.amount; });
			(currentCreditSalesByStation[sId] || []).forEach((el) => { periodcreditor += el.amount; });
			(currentPriceMovmentsByStation[sId] || []).forEach((el) => {
				if (el.creditor) periodcreditor += el.creditor;
				if (el.debtor) perioddebtor += el.debtor;
			});
			(currentQuantityDeductionsByStation[sId] || []).forEach((el) => { periodcreditor += el.amount * el.price; });

			// --- Past Period Calculations ---
			let opening_debtor = (pastFinancialOpsByStation[sId] || []).reduce((sum, el) => sum + (+el.debtor || 0), 0);
			let opening_creditor = (pastFinancialOpsByStation[sId] || []).reduce((sum, el) => sum + (+el.creditor || 0), 0);

			(pastIncomesByStation[sId] || []).forEach((el) => { opening_debtor += el.amount * el.price; });
			(pastSurplusByStation[sId] || []).forEach((el) => { opening_debtor += el.amount * el.price; });
			(pastDepositsByStation[sId] || []).forEach((el) => { opening_creditor += el.amount; });
			(pastCreditSalesByStation[sId] || []).forEach((el) => { opening_creditor += el.amount; });
			(pastPriceMovmentsByStation[sId] || []).forEach((el) => {
				if (el.creditor) opening_creditor += el.creditor;
				if (el.debtor) opening_debtor += el.debtor;
			});
			(pastQuantityDeductionsByStation[sId] || []).forEach((el) => { opening_creditor += el.amount * el.price; });

			const opening_balance_diff = opening_debtor - opening_creditor;
			const opening_balance_debtor = opening_balance_diff > 0 ? opening_balance_diff : 0;
			const opening_balance_creditor = opening_balance_diff < 0 ? Math.abs(opening_balance_diff) : 0;

			// --- Final Balances ---
			const total_all_debtor = opening_balance_debtor + perioddebtor;
			const total_all_creditor = opening_balance_creditor + periodcreditor;
			const final_balance = total_all_debtor - total_all_creditor;

			const balance_debtor = final_balance > 0 ? final_balance : 0;
			const balance_creditor = final_balance < 0 ? Math.abs(final_balance) : 0;

			const final_statment =
				final_balance < 0
					? `دائن ${tafqeet(Math.abs(final_balance))} ريال فقط لا غير`
					: `مدين ${tafqeet(Math.abs(final_balance))} ريال فقط لا غير`;

			results.push({
				station_id: station.id,
				station_name: station.name,
				opening_balance_debtor,
				opening_balance_creditor,
				movment_debtor: perioddebtor,
				movment_creditor: periodcreditor,
				balance_debtor,
				balance_creditor,
				final_statment,
			});
			console.timeEnd(`station-${station.id}`);
		}

		// Calculate Totals globally
		const totals = results.reduce(
			(acc, curr) => {
				acc.total_opening_balance_debtor += curr.opening_balance_debtor;
				acc.total_opening_balance_creditor += curr.opening_balance_creditor;
				acc.total_movment_debtor += curr.movment_debtor;
				acc.total_movment_creditor += curr.movment_creditor;
				acc.total_balance_debtor += curr.balance_debtor;
				acc.total_balance_creditor += curr.balance_creditor;
				return acc;
			},
			{
				total_opening_balance_debtor: 0,
				total_opening_balance_creditor: 0,
				total_movment_debtor: 0,
				total_movment_creditor: 0,
				total_balance_debtor: 0,
				total_balance_creditor: 0,
			}
		);

		const total_balance = totals.total_balance_debtor - totals.total_balance_creditor;
		const total_final_statment =
			total_balance < 0
				? `دائن ${tafqeet(Math.abs(total_balance))} ريال فقط لا غير`
				: `مدين ${tafqeet(Math.abs(total_balance))} ريال فقط لا غير`;

		console.timeEnd("report");
		
		res.status(200).json({
			state: "success",
			data: {
				stations: results,
				totals: {
					total_opening_balance_debtor: totals.total_opening_balance_debtor,
					total_opening_balance_creditor: totals.total_opening_balance_creditor,
					total_movment_debtor: totals.total_movment_debtor,
					total_movment_creditor: totals.total_movment_creditor,
					total_balance_debtor: totals.total_balance_debtor,
					total_balance_creditor: totals.total_balance_creditor,
					total_final_statment,
				},
				info: {
					startDate: req.query.startDate,
					endDate: req.query.endDate,
				},
			},
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
