const catchAsync = require("../utils/catchAsync");
const sequelize = require("./../connection");
const AppError = require("../utils/appError");
const { getModel } = require("../utils/modelSelect");

const { Sequelize, Op, fn, col, literal } = require("sequelize");
const tafqeet = require("../utils/Tafqeet");

exports.getStoresMovmentInPeriod = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const MovmentModel = getModel(req.headers["x-year"], "movment");
			const StationModel = getModel(req.headers["x-year"], "station");
			const SubstanceModel = getModel(req.headers["x-year"], "substance");
			const StoreModel = getModel(req.headers["x-year"], "store");
			const StoreMovmentModel = getModel(
				req.headers["x-year"],
				"store_movment"
			);
			const IncomeModel = getModel(req.headers["x-year"], "income");
			const CreditSaleModel = getModel(req.headers["x-year"], "credit_sale");
			// const CreditSaleSettlementModel = getModel(
			// 	req.headers["x-year"],
			// 	"credit_sale_settlement"
			// );
			const CalibrationModel = getModel(req.headers["x-year"], "calibration");
			const OtherModel = getModel(req.headers["x-year"], "other");
			const SurplusModel = getModel(req.headers["x-year"], "surplus");
			const MovmentsShiftsModel = getModel(
				req.headers["x-year"],
				"movments_shift"
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
					(ele) => ele.movment_id === el.id && ele.number === 1
				);
				const startMovment = stores_movments.filter(
					(ele) => ele.movment_id === el.id && ele.shift_id === startShift[0].id
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
						(ele) => ele.movment_id === el.id && ele.number === el.shifts
					);
					endMovment = stores_movments.filter(
						(ele) => ele.movment_id === el.id && ele.shift_id === endShift[0].id
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
			const StationModel = getModel(req.headers["x-year"], "station");
			const SubstanceModel = getModel(req.headers["x-year"], "substance");
			const StoreModel = getModel(req.headers["x-year"], "store");
			const MovmentModel = getModel(req.headers["x-year"], "movment");
			const StoreMovmentModel = getModel(
				req.headers["x-year"],
				"store_movment"
			);
			const IncomeModel = getModel(req.headers["x-year"], "income");
			const QuantityDeductionModel = getModel(
				req.headers["x-year"],
				"quantity_deduction"
			);
			const SurplusModel = getModel(req.headers["x-year"], "surplus");
			const CalibrationModel = getModel(req.headers["x-year"], "calibration");
			const OtherModel = getModel(req.headers["x-year"], "other");
			const CreditSaleModel = getModel(req.headers["x-year"], "credit_sale");
			// const CreditSaleSettlementModel = getModel(
			// 	req.headers["x-year"],
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
					(group) => group.store_id === item.store_id
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
				console.log(`total_cash`, total_cash);
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
						+group.quantityDeduction -
						+group.branchWithdrawals,
					// + +group.coverd_credit_sales_amount,
					total_cash: group.total_cash,
					totalSpend:
						+minDateData.prev_value +
						+group.income +
						+group.calibration -
						group.quantityDeduction -
						+maxDateData.curr_value,
					final_value: +maxDateData.curr_value,
				};
			});

			const groupedStores = storesMovmentsArr.reduce((acc, item) => {
				const existingGroup = acc.find(
					(group) => group.substance_id === item["store.substance.id"]
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
exports.getDispensersMovmentInPeriod = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const MovmentModel = getModel(req.headers["x-year"], "movment");
			const StationModel = getModel(req.headers["x-year"], "station");
			const SubstanceModel = getModel(req.headers["x-year"], "substance");
			const TankModel = getModel(req.headers["x-year"], "tank");
			const DispenserModel = getModel(req.headers["x-year"], "dispenser");
			const MovmentsShiftsModel = getModel(
				req.headers["x-year"],
				"movments_shift"
			);
			const DispenserMovmentModel = getModel(
				req.headers["x-year"],
				"dispenser_movment"
			);
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
					(group) => group.dispenser_id === item.dispenser_id
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
					(group) => group.substance_id === item["dispenser.tank.substance.id"]
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
			const DepositModel = getModel(req.headers["x-year"], "deposit");
			const BankModel = getModel(req.headers["x-year"], "bank");
			const StationModel = getModel(req.headers["x-year"], "station");

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
			const MovmentModel = getModel(req.headers["x-year"], "movment");
			const IncomeModel = getModel(req.headers["x-year"], "income");
			const CalibrationModel = getModel(req.headers["x-year"], "calibration");
			const SurplusModel = getModel(req.headers["x-year"], "surplus");
			const StoreModel = getModel(req.headers["x-year"], "store");
			const SubstanceModel = getModel(req.headers["x-year"], "substance");
			const StationModel = getModel(req.headers["x-year"], "station");

			const storesIds = req.query.stores.split(",").map(Number);
			console.log(`req.query`, req.query);
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
				}, {})
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
			const MovmentModel = getModel(req.headers["x-year"], "movment");
			const DispenserModel = getModel(req.headers["x-year"], "dispenser");

			const SubstanceModel = getModel(req.headers["x-year"], "substance");
			const TankModel = getModel(req.headers["x-year"], "tank");
			const DispenserMovmentModel = getModel(
				req.headers["x-year"],
				"dispenser_movment"
			);
			const StoreModel = getModel(req.headers["x-year"], "store");
			const StoreMovmentModel = getModel(
				req.headers["x-year"],
				"store_movment"
			);

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
						(ele) => ele.dispenser_id === el.dispenser_id
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
						(ele) => ele.store_id === el.store_id
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
			const CalibrationReportModel = getModel(
				req.headers["x-year"],
				"calibration_report"
			);
			const calibrationModel = getModel(req.headers["x-year"], "calibration");
			const calibrationMemberModel = getModel(
				req.headers["x-year"],
				"calibration_member"
			);
			const StationModel = getModel(req.headers["x-year"], "station");
			const MovmentModel = getModel(req.headers["x-year"], "movment");
			const StoreModel = getModel(req.headers["x-year"], "store");
			const SubstanceModel = getModel(req.headers["x-year"], "substance");
			const DispenserModel = getModel(req.headers["x-year"], "dispenser");

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
					(group) => group.substance_id === item["store.substance.id"]
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
				const MovmentModel = getModel(req.headers["x-year"], "movment");
				const DispenserModel = getModel(req.headers["x-year"], "dispenser");
				const DispenserMovmentModel = getModel(
					req.headers["x-year"],
					"dispenser_movment"
				);
				const TankModel = getModel(req.headers["x-year"], "tank");
				const SubstanceModel = getModel(req.headers["x-year"], "substance");
				const StoreModel = getModel(req.headers["x-year"], "store");
				const OtherModel = getModel(req.headers["x-year"], "other");
				const ReceivesModel = getModel(req.headers["x-year"], "receives");
				const BranchWithdrawalsModel = getModel(
					req.headers["x-year"],
					"branch_withdrawals"
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
								"SUM((curr_A - prev_A + curr_B - prev_B) * price)"
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
				const cash = dispensersCash.concat(
					othersCash,
					branchWithdrawalsCash,
					receives,
					opening
				);
				// Sort the combined array based on the date in ascending order
				let perioddebtor = 0;
				let periodcreditor = 0;
				cash.sort((a, b) => new Date(a.date) - new Date(b.date));
				cash.forEach((el, i) => {
					if (i !== 0) {
						perioddebtor = perioddebtor + el.debtor;
						periodcreditor = periodcreditor + el.creditor;
						el.balance = cash[i - 1].balance - el.debtor + el.creditor;
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
								Math.abs(cash[cash.length - 1].balance)
						  )} ريال فقط لا غير`
						: `مدين ${tafqeet(
								Math.abs(cash[cash.length - 1].balance)
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
	}
);
exports.getStationAccountStatementReport = catchAsync(
	async (req, res, next) => {
		try {
			await req.db.transaction(async (t) => {
				const MovmentModel = getModel(req.headers["x-year"], "movment");
				const IncomeModel = getModel(req.headers["x-year"], "income");
				const SubstanceModel = getModel(req.headers["x-year"], "substance");
				const StoreModel = getModel(req.headers["x-year"], "store");
				const SurplusModel = getModel(req.headers["x-year"], "surplus");
				const priceMovmentEntriesModel = getModel(
					req.headers["x-year"],
					"price_movment_entries"
				);
				const BankModel = getModel(req.headers["x-year"], "bank");
				const DepositModel = getModel(req.headers["x-year"], "deposit");
				const StationModel = getModel(req.headers["x-year"], "station");
				const CreditSaleSettlementModel = getModel(
					req.headers["x-year"],
					"credit_sale_settlement"
				);
				const ClientModel = getModel(req.headers["x-year"], "client");
				const QuantityDeductionModel = getModel(
					req.headers["x-year"],
					"quantity_deduction"
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
				//الواردات
				const incomes = await IncomeModel.findAll({
					where: {
						station_id: +req.query.station,
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
					el.statement = `مقابل ${el.amount.toLocaleString("en")} لتر ${
						el["store.substance.name"]
					} وارد بسعر ${el.price}`;
				});
				// الواردات السابقة
				const prevIncomes = await IncomeModel.findAll({
					where: {
						station_id: +req.query.station,
						movment_id: {
							[Op.in]: prevMovmentsIds,
						},
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
				//الفائض
				const surplus = await SurplusModel.findAll({
					where: {
						station_id: +req.query.station,
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
					el.statement = `مقابل ${el.amount.toLocaleString("en")} لتر ${
						el["store.substance.name"]
					} فائض بسعر ${el.price}`;
				});
				//الفائض السابق
				const prevSurplus = await SurplusModel.findAll({
					where: {
						station_id: +req.query.station,
						movment_id: {
							[Op.in]: prevMovmentsIds,
						},
					},
					attributes: [
						"id", // We want to group by station_id
						[req.db.literal("SUM(price * amount)"), "debtor"],
						[req.db.literal(0), "creditor"],
					],
					group: ["id"],
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
						"en"
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
					el.statement = `سداد مبيعات آجلة لـ ${el["client.name"]} ${
						el.type === "نقدي"
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
					attributes: [
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
						date: {
							[Op.lt]: startDate,
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
							(+prevSurplus[0]?.debtor || 0) +
							(+prevQuantityDeduction[0]?.total_debtor || 0) +
							(+prevPriceMovmentEntries[0]?.total_debtor || 0),
						creditor:
							(+prevDeposits[0]?.creditor || 0) +
							(+prevCreditSalesSettlements[0]?.creditor || 0) +
							(+prevQuantityDeduction[0]?.total_creditor || 0) +
							(+prevPriceMovmentEntries[0]?.total_creditor || 0),
						balance:
							(+prevIncomes[0]?.debtor || 0) +
							(+prevSurplus[0]?.debtor || 0) -
							(+prevDeposits[0]?.creditor || 0) -
							(+prevQuantityDeduction[0]?.total_creditor || 0) +
							(+prevPriceMovmentEntries[0]?.total_debtor || 0) -
							(+prevCreditSalesSettlements[0]?.creditor || 0) -
							(+prevPriceMovmentEntries[0]?.total_creditor || 0),
					},
				];
				const cash = opening.concat(
					deposits,
					surplus,
					incomes,
					priceMovmentEntries,
					creditSalesSettlements,
					quantityDeductions
				);
				//ترتيب حسب التاريخ
				let perioddebtor = 0;
				let periodcreditor = 0;
				cash.sort((a, b) => new Date(a.date) - new Date(b.date));
				cash.forEach((el, i) => {
					if (i !== 0) {
						perioddebtor = perioddebtor + el.debtor;
						periodcreditor = periodcreditor + +el.creditor;
						el.balance = cash[i - 1].balance + el.debtor - el.creditor;
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
								Math.abs(cash[cash.length - 1].balance)
						  )} ريال فقط لا غير`
						: `مدين ${tafqeet(
								Math.abs(cash[cash.length - 1].balance)
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
	}
);
exports.getBoxAccountStatementReport = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const MovmentModel = getModel(req.headers["x-year"], "movment");
			const StoreModel = getModel(req.headers["x-year"], "store");
			const DepositModel = getModel(req.headers["x-year"], "deposit");
			const BankModel = getModel(req.headers["x-year"], "bank");
			const StationModel = getModel(req.headers["x-year"], "station");
			const SubstanceModel = getModel(req.headers["x-year"], "substance");
			const CreditSaleSettlementModel = getModel(
				req.headers["x-year"],
				"credit_sale_settlement"
			);
			const OtherModel = getModel(req.headers["x-year"], "other");
			const DispenserMovmentModel = getModel(
				req.headers["x-year"],
				"dispenser_movment"
			);
			const BranchWithdrawalsModel = getModel(
				req.headers["x-year"],
				"branch_withdrawals"
			);
			const CreditSaleModel = getModel(req.headers["x-year"], "credit_sale");
			const CalibrationModel = getModel(req.headers["x-year"], "calibration");
			const ClientModel = getModel(req.headers["x-year"], "client");
			const DispenserModel = getModel(req.headers["x-year"], "dispenser");
			const TankModel = getModel(req.headers["x-year"], "tank");
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
				el.statement = `مقابل توريد ${el.amount.toLocaleString("en")} ريال ل${
					el["bank.name"]
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
					[req.db.literal("SUM(amount)"), "creditor"],
					[req.db.literal(0), "debtor"],
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
				el.statement = `قمية مبيعات آجلة لـ ${el["client.name"]} بتاريخ ${el.date} `;
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
					// [
					// 	req.db.literal(
					// 		"SUM((curr_A + curr_B - prev_A - prev_B) * price)"
					// 	),
					// 	"creditor",
					// ],
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
					[
						req.db.literal("SUM((curr_A - prev_A + curr_B - prev_B) * price)"),
						"cash",
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

			//مسحوبات الفرع حسب المادة والحركة
			const branchWithdrawalsCash = await BranchWithdrawalsModel.findAll({
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
			const prevBranchWithdrawalsCash = await BranchWithdrawalsModel.findAll({
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
							dispenser["dispenser.tank.substance.id"]
				)[0];

				const branchWithdrawals = branchWithdrawalsCash.filter(
					(el) =>
						el["movment.id"] === dispenser["movment.id"] &&
						el["store.substance.id"] ===
							dispenser["dispenser.tank.substance.id"]
				)[0];
				const calibration = calibrationsCash.filter(
					(el) =>
						el["movment.id"] === dispenser["movment.id"] &&
						el["store.substance.id"] ===
							dispenser["dispenser.tank.substance.id"]
				)[0];
				const creditSales = creditSalesCash.filter(
					(el) =>
						el["movment.id"] === dispenser["movment.id"] &&
						el["store.substance.id"] ===
							dispenser["dispenser.tank.substance.id"]
				)[0];
				if (other) {
					dispenser.creditor = +dispenser.creditor - +other.total_cash;

					dispenser.amount = +dispenser.amount - +other.total_amount;
				}
				if (calibration) {
					dispenser.creditor = +dispenser.creditor - +calibration.total_cash;
					dispenser.amount = +dispenser.amount - +calibration.total_amount;
				}
				if (branchWithdrawals) {
					dispenser.creditor =
						+dispenser.creditor - +branchWithdrawals.total_cash;
					dispenser.amount =
						+dispenser.amount - +branchWithdrawals.total_amount;
				}
				if (creditSales) {
					dispenser.creditor = +dispenser.creditor - +creditSales.total_cash;
					dispenser.amount = +dispenser.amount - +creditSales.total_amount;
				}
				dispenser.statement = `قيمة مبيعات ${dispenser.amount} لتر ${dispenser["dispenser.tank.substance.name"]} بسعر ${dispenser.price}`;
				dispenser.creditor = +dispenser.amount * +dispenser.price;
				dispenser.debtor = 0;
				dispenser.date = dispenser["movment.date"];
			});

			//حساب الرصيد الافتتاحي
			const opening = [
				{
					date: previousDay,
					id: "-",
					statement: "رصيد سابق",
					debtor:
						(+prevDispensersCash[0]?.cash || 0) -
						(+prevBranchWithdrawalsCash[0]?.cash || 0) -
						(+prevCreditSalesCash[0]?.cash || 0) -
						(+prevCalibrationsCash[0]?.cash || 0) -
						(+prevOthersCash[0]?.cash || 0),
					creditor:
						(+prevDeposits[0]?.creditor || 0) +
						(+prevCreditSalesSettlements[0]?.creditor || 0),
					balance:
						(+prevDispensersCash[0]?.cash || 0) -
						(+prevBranchWithdrawalsCash[0]?.cash || 0) -
						(+prevCreditSalesCash[0]?.cash || 0) -
						(+prevCalibrationsCash[0]?.cash || 0) -
						(+prevOthersCash[0]?.cash || 0) -
						(+prevCreditSalesSettlements[0]?.creditor || 0) -
						(+prevDeposits[0]?.creditor || 0),
				},
			];
			//ترتيب حسب التاريخ
			const cash = opening.concat(dispensers, deposits, CreditSaleSettlements);
			let perioddebtor = 0;
			let periodcreditor = 0;
			cash.sort((a, b) => new Date(a.date) - new Date(b.date));
			const filterdCash = cash.filter(
				(el) => el.creditor !== 0 || el.debtor !== 0
			);
			filterdCash.forEach((el, i) => {
				if (i !== 0) {
					perioddebtor = perioddebtor + el.debtor;
					periodcreditor = periodcreditor + +el.creditor;
					el.balance = filterdCash[i - 1].balance - +el.debtor + +el.creditor;
				}
			});

			const station = await StationModel.findOne({
				where: {
					id: +req.query.station,
				},
				transaction: t,
			});
			const final_statment =
				filterdCash[filterdCash.length - 1].balance > 0
					? `دائن ${tafqeet(
							Math.abs(filterdCash[filterdCash.length - 1].balance)
					  )} ريال فقط لا غير`
					: `مدين ${tafqeet(
							Math.abs(filterdCash[filterdCash.length - 1].balance)
					  )} ريال فقط لا غير`;
			res.status(200).json({
				state: "success",
				data: {
					cash: filterdCash,
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
			const MovmentModel = getModel(req.headers["x-year"], "movment");
			const StoreModel = getModel(req.headers["x-year"], "store");
			const SubstanceModel = getModel(req.headers["x-year"], "substance");
			const BranchWithdrawalsModel = getModel(
				req.headers["x-year"],
				"branch_withdrawals"
			);
			const StationModel = getModel(req.headers["x-year"], "station");
			const CreditSaleSettlementModel = getModel(
				req.headers["x-year"],
				"credit_sale_settlement"
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
							Math.abs(cash[cash.length - 1].balance)
					  )} ريال فقط لا غير`
					: `مدين ${tafqeet(
							Math.abs(cash[cash.length - 1].balance)
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
			const MovmentModel = getModel(req.headers["x-year"], "movment");
			const StoreModel = getModel(req.headers["x-year"], "store");
			const SubstanceModel = getModel(req.headers["x-year"], "substance");
			const CreditSaleModel = getModel(req.headers["x-year"], "credit_sale");
			const ClientModel = getModel(req.headers["x-year"], "client");
			const CreditSaleSettlementModel = getModel(
				req.headers["x-year"],
				"credit_sale_settlement"
			);
			const StationModel = getModel(req.headers["x-year"], "station");

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
							Math.abs(cash[cash.length - 1].balance)
					  )} ريال فقط لا غير`
					: `مدين ${tafqeet(
							Math.abs(cash[cash.length - 1].balance)
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
			const StocktakingModel = getModel(req.headers["x-year"], "stocktaking");
			const StocktakingMembersModel = getModel(
				req.headers["x-year"],
				"stocktaking_members"
			);
			const StocktakingStoresMovmentsModel = getModel(
				req.headers["x-year"],
				"stocktaking_stores_movments"
			);
			const StationModel = getModel(req.headers["x-year"], "station");
			const SubstanceModel = getModel(req.headers["x-year"], "substance");
			const MovmentModel = getModel(req.headers["x-year"], "movment");
			const MovmentsShiftsModel = getModel(
				req.headers["x-year"],
				"movments_shift"
			);
			const DispenserModel = getModel(req.headers["x-year"], "dispenser");
			const DispenserMovmentModel = getModel(
				req.headers["x-year"],
				"dispenser_movment"
			);
			const TankModel = getModel(req.headers["x-year"], "tank");
			const StoreModel = getModel(req.headers["x-year"], "store");
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
			const MovmentModel = getModel(req.headers["x-year"], "movment");
			const StationModel = getModel(req.headers["x-year"], "station");
			const SubstanceModel = getModel(req.headers["x-year"], "substance");
			const TankModel = getModel(req.headers["x-year"], "tank");
			const StoreModel = getModel(req.headers["x-year"], "store");
			const MovmentsShiftsModel = getModel(
				req.headers["x-year"],
				"movments_shift"
			);
			const StoreMovmentModel = getModel(
				req.headers["x-year"],
				"store_movment"
			);
			const StocktakingStoresMovmentsModel = getModel(
				req.headers["x-year"],
				"stocktaking_stores_movments"
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
				})
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
				})
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
							})
						),
					})
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
exports.getCreditSalesByStoreIdAndClientsIds = catchAsync(
	async (req, res, next) => {
		try {
			await req.db.transaction(async (t) => {
				const MovmentModel = getModel(req.headers["x-year"], "movment");
				const StationModel = getModel(req.headers["x-year"], "station");
				const SubstanceModel = getModel(req.headers["x-year"], "substance");
				const StoreModel = getModel(req.headers["x-year"], "store");
				const CreditSaleModel = getModel(req.headers["x-year"], "credit_sale");
				const CreditSaleSettlementModel = getModel(
					req.headers["x-year"],
					"credit_sale_settlement"
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
				const movmentsIds = movments.map((el) => el.id);
				const clients = req.query.clients.split(",").map(Number);
				const creditSales = await CreditSaleModel.findAll({
					where: {
						station_id: req.query.station,
						store_id: req.query.store,
						movment_id: {
							[Op.in]: movmentsIds,
						},
						client_id: {
							[Op.in]: clients,
						},
					},
					include: [
						{
							model: MovmentModel,
							attributes: ["date"],
						},
						{
							model: CreditSaleSettlementModel,
							attributes: ["date"],
						},
					],
					transaction: t,
					raw: true,
				});
				creditSales.forEach((el) => {
					el.value = el.amount * el.price;
					el.isSettled = +el.isSettled;
				});
				creditSales.sort((a, b) => {
					return new Date(a["movment.date"]) - new Date(b["movment.date"]);
				});
				const station = await StationModel.findAll({
					where: {
						id: req.query.station,
					},
					raw: true,
					transaction: t,
				});
				res.status(200).json({
					state: "success",
					data: {
						info: {
							station_name: station.name,
							store_name: `${store.name} - ${store["substance.name"]}`,
							startDate: req.query.startDate,
							endDate: req.query.endDate,
							creditSales,
						},
					},
				});
			});
		} catch (error) {
			return next(new AppError(error, 500));
		}
	}
);
exports.getAnnualIncomes = catchAsync(async (req, res, next) => {
	try {
		const StoreModel = getModel(req.headers["x-year"], "store");
		const SubstanceModel = getModel(req.headers["x-year"], "substance");
		const IncomeModel = getModel(req.headers["x-year"], "income");
		const SurplusModel = getModel(req.headers["x-year"], "surplus");
		const CalibrationModel = getModel(req.headers["x-year"], "calibration");
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
			const StoreModel = getModel(req.headers["x-year"], "store");
			const SubstanceModel = getModel(req.headers["x-year"], "substance");
			const StoreMovmentModel = getModel(
				req.headers["x-year"],
				"store_movment"
			);
			const QuantityDeductionModel = getModel(
				req.headers["x-year"],
				"quantity_deduction"
			);
			const MovmentsShiftsModel = getModel(
				req.headers["x-year"],
				"movments_shift"
			);
			const StocktakingModel = getModel(req.headers["x-year"], "stocktaking");
			const StocktakingStoresMovmentsModel = getModel(
				req.headers["x-year"],
				"stocktaking_stores_movments"
			);
			const MovmentModel = getModel(req.headers["x-year"], "movment");
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
						(ele) => ele.substance_id === el.substanceId
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
						(ele) => ele.substance_id === el["store.substance.id"]
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
			const AnnualStocktakingModel = getModel(
				req.headers["x-year"],
				"annual_stocktaking"
			);
			const AnnualStocktakingMemberModel = getModel(
				req.headers["x-year"],
				"annual_stocktaking_member"
			);
			const AnnualStocktakingCashModel = getModel(
				req.headers["x-year"],
				"annual_stocktaking_cash"
			);
			const AnnualStocktakingTankModel = getModel(
				req.headers["x-year"],
				"annual_stocktaking_tank"
			);
			const AnnualStocktakingSurplusDeficitModel = getModel(
				req.headers["x-year"],
				"annual_stocktaking_surplus_deficit"
			);
			const StationModel = getModel(req.headers["x-year"], "station");
			const TankModel = getModel(req.headers["x-year"], "tank");
			const SubstanceModel = getModel(req.headers["x-year"], "substance");
			const MovmentModel = getModel(req.headers["x-year"], "movment");
			const DispenserModel = getModel(req.headers["x-year"], "dispenser");
			const MovmentsShiftsModel = getModel(
				req.headers["x-year"],
				"movments_shift"
			);
			const DispenserMovmentModel = getModel(
				req.headers["x-year"],
				"dispenser_movment"
			);
			const StoreModel = getModel(req.headers["x-year"], "store");
			const StoreMovmentModel = getModel(
				req.headers["x-year"],
				"store_movment"
			);
			const IncomeModel = getModel(req.headers["x-year"], "income");
			const OtherModel = getModel(req.headers["x-year"], "other");
			const QuantityDeductionModel = getModel(
				req.headers["x-year"],
				"quantity_deduction"
			);

			const CreditSaleModel = getModel(req.headers["x-year"], "credit_sale");

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

			// Get members
			const members = await AnnualStocktakingMemberModel.findAll({
				where: {
					annual_stocktaking_id: req.params.id,
				},
				transaction: t,
				raw: true,
			});

			const groupedMembers = [];
			for (let i = 0; i < members.length; i += 3) {
				const group = {
					name_1: members[i]?.name || "",
					name_2: members[i + 1]?.name || "",
					name_3: members[i + 2]?.name || "",
					title_1: members[i]?.title || "",
					title_2: members[i + 1]?.title || "",
					title_3: members[i + 2]?.title || "",
				};
				groupedMembers.push(group);
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
			const surplusDeficit = await AnnualStocktakingSurplusDeficitModel.findAll(
				{
					where: {
						annual_stocktaking_id: req.params.id,
					},
					transaction: t,
					raw: true,
				}
			);

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
					(group) => group.substance === substanceName
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
					(group) => group.store_id === item.store_id
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
				attributes: [
					"store_id",
					[req.db.fn("SUM", req.db.col("amount")), "total_amount"],
				],
				group: ["store_id"],
				raw: true,
				transaction: t,
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
					others: +othersAmount,
					creditSales: +creditSalesAmount,
					totalSpend:
						+minDateData?.prev_value + +incomeAmount - +maxDateData?.curr_value,
				};
			});

			// Calculate sums by substance
			const sumBySubstance = storesMovmentsArr.reduce((acc, item) => {
				const existing = acc.find(
					(el) => el.substance_id === item.substance_id
				);
				if (existing) {
					existing.income += item.income;
					existing.prev_value += item.prev_value;
					existing.curr_value += item.curr_value;
					existing.total_spend += item.totalSpend;
				} else {
					acc.push({
						substance_id: item.substance_id,
						income: item.income,
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
						el.store_type === item.store_type
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
			const substancesData = allSubstances.map((substance) => {
				const prev_value =
					sumBySubstance.find((el) => el.substance_id === substance.id)
						?.prev_value || 0;
				const curr_value =
					sumBySubstance.find((el) => el.substance_id === substance.id)
						?.curr_value || 0;
				const income =
					sumBySubstance.find((el) => el.substance_id === substance.id)
						?.income || 0;
				const totalCashSpend =
					sumBySubstanceAndType.find(
						(el) => el.substance_id === substance.id && el.store_type === "نقدي"
					)?.totalSpend || 0;
				const totalOthersSpend =
					sumBySubstanceAndType.find(
						(el) => el.substance_id === substance.id && el.store_type === "مجنب"
					)?.totalSpend || 0;

				// Get tanks total for this substance
				const substanceTanks = groupedTanks.find(
					(el) => el.substance_id === substance.id
				);
				const tanksTotalAmount = substanceTanks?.total_liter || 0;

				const deficit = +tanksTotalAmount - curr_value;

				// Calculate final values based on deficit
				let finalIncome = 0;
				let finalSpent = 0;
				if (deficit > 0) {
					finalIncome = deficit + income + prev_value;
					finalSpent = totalCashSpend + totalOthersSpend;
				} else if (deficit < 0) {
					finalIncome = income + prev_value;
					finalSpent = totalCashSpend + totalOthersSpend - deficit;
				} else {
					finalIncome = income + prev_value;
					finalSpent = totalCashSpend + totalOthersSpend;
				}

				// Get tanks data for this substance from groupedTanks
				const substanceTanksData = groupedTanks.find(
					(el) => el.substance_id === substance.id
				);

				return {
					substance_id: substance.id,
					name: substance.name,
					tanks: substanceTanksData?.data || [],
					tanks_total_liter: substanceTanksData?.total_liter || 0,
					storesMovment: [
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
							title: "منصرف أخرى",
							income: 0,
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
					],
				};
			});

			// Build substancesSummary array with curr_value, tanks value, surplus/deficit
			const substancesSummary = allSubstances.map((substance) => {
				const curr_value =
					sumBySubstance.find((el) => el.substance_id === substance.id)
						?.curr_value || 0;

				// Get tanks total for this substance (check by substance_id)
				const substanceTanks = groupedTanks.find(
					(el) => +el.substance_id === +substance.id
				);
				const tanks_value = substanceTanks?.total_liter || 0;
				// Get surplus/deficit for this substance
				const substanceSurplusDeficit = surplusDeficit.find(
					(el) => +el.substance_id === +substance.id
				);

				const deficitAmount = +substanceSurplusDeficit?.deficit || 0;
				const surplusAmount = +substanceSurplusDeficit?.surplus || 0;
				const price = +substanceSurplusDeficit?.price || 0;
				console.log(`surplusAmount`, surplusAmount);
				console.log(`deficitAmount`, deficitAmount);

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
					(group) => group.dispenser_id === item.dispenser_id
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
					(group) => group.substance_id === item.substance_id
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

			res.status(200).json({
				state: "success",
				data: {
					info: {
						id: annualStocktaking.id,
						station_id: annualStocktaking.station_id,
						station_name: annualStocktaking.station?.name,
						supervisor: annualStocktaking.station?.supervisor,
						date: `${req.headers["x-year"]}-12-31`,
						year: req.headers["x-year"],
					},
					members: groupedMembers,
					cash: {
						details: cashDetails,
						total: cashTotal,
					},
					surplusDeficit,
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
