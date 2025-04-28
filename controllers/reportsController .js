const catchAsync = require("../utils/catchAsync");
const MovmentModel = require("./../models/movmentModel");
const sequelize = require("./../connection");
const AppError = require("../utils/appError");
const StationModel = require("../models/stationModel");
const DispenserMovmentModel = require("../models/dispenserMovmentModel");
const IncomeModel = require("../models/incomeModel");
const StoreMovmentModel = require("../models/storeMovmentModel");
const OtherModel = require("../models/otherModel");
const { Sequelize, Op, fn, col } = require("sequelize");
const StoreModel = require("../models/storeModel");
const SubstanceModel = require("../models/substanceModel");
const DispenserModel = require("../models/dispenserModel");
const TankModel = require("../models/tankModel");
const calibrationModel = require("../models/calibrationModel");
const calibrationMemberModel = require("../models/calibrationMemberModel");
const StoresTransferModel = require("../models/storesTransferModel");
const SurplusModel = require("../models/surplusModel");
const BranchWithdrawalsModel = require("../models/branchWithdrawalsModel");
const StocktakingStoresMovmentsModel = require("../models/stocktakingStoresMovmentsModel");
const CalibrationReportModel = require("../models/calibrationReportModel");
const EmployeesModel = require("../models/employeeModel");
const DepositModel = require("../models/depositModel");
const ReceivesModel = require("../models/receiveModel");
const tafqeet = require("../utils/Tafqeet");
const BankModel = require("../models/bankModel");
const priceMovmentEntriesModel = require("../models/priceMovmentEntriesModel");
const StocktakingModel = require("../models/stocktakingModel");
const StocktakingMembersModel = require("../models/stocktakingMembersModel");
const CalibrationModel = require("../models/calibrationModel");
const MovmentsShiftsModel = require("../models/movmentsShiftsModel");

exports.getStoresMovmentInPeriod = catchAsync(async (req, res, next) => {
	try {
		await sequelize.transaction(async (t) => {
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
			const station = await StationModel.findAll({
				where: {
					id: req.query.station,
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
				},
				raw: true,
			});

			const stores = await StoreModel.findAll({
				where: {
					station_id: req.query.station,
					substance_id: req.query.substance,
				},
				include: [
					{
						model: SubstanceModel,
						attributes: ["id", "name"],
					},
				],
				attributes: ["id"],
				raw: true,
				transaction: t,
			});

			const storesIds = stores.map((el) => el.id);
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
					"movment_id",
					"store_id",
					[sequelize.fn("SUM", sequelize.col("amount")), "total_amount"],
				],
				group: ["movment_id", "store_id"],
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
					"movment_id",
					"store_id",
					[sequelize.fn("SUM", sequelize.col("amount")), "total_amount"],
				],
				group: ["movment_id", "store_id"],
				raw: true,
				transaction: t,
			});
			const stockTaking = await StocktakingStoresMovmentsModel.findAll({
				where: {
					station_id: req.query.station,
					store_id: {
						[Op.in]: storesIds,
					},
					movment_id: {
						[Op.in]: movmentsIds,
					},
				},
				raw: true,
				transaction: t,
			});
			const branchWithdrawals = await BranchWithdrawalsModel.findAll({
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
					"movment_id",
					"store_id",
					[sequelize.fn("SUM", sequelize.col("amount")), "total_amount"],
				],
				group: ["movment_id", "store_id"],
				raw: true,
				transaction: t,
			});
			const stores_movments = await StoreMovmentModel.findAll({
				where: {
					station_id: req.query.station,
					store_id: {
						[Op.in]: storesIds,
					},
					date: {
						[Op.between]: [req.query.startDate, req.query.endDate], // Assuming startDate and endDate are defined
					},
				},
				attributes: [
					"movment_id",
					"shift_id",
					"price",
					[
						sequelize.fn("SUM", sequelize.col("prev_value")),
						"total_prev_value",
					],
					[
						sequelize.fn("SUM", sequelize.col("curr_value")),
						"total_curr_value",
					],
				],
				group: ["movment_id", "shift_id", "price"],
				raw: true,
				transaction: t,
			});
			movments.forEach((el) => {
				let stockTakingValue = 0;
				stockTaking
					.filter((ele) => ele.movment_id === el.id)
					.forEach((ele) => {
						stockTakingValue =
							stockTakingValue + ele.curr_value - ele.prev_value;
					});
				const startShift = shifts.filter(
					(ele) => ele.movment_id === el.id && ele.number === 1
				);
				const endShift = shifts.filter(
					(ele) => ele.movment_id === el.id && ele.number === el.shifts
				);
				const startMovment = stores_movments.filter(
					(ele) => ele.movment_id === el.id && ele.shift_id === startShift[0].id
				)[0];
				const endMovment = stores_movments.filter(
					(ele) => ele.movment_id === el.id && ele.shift_id === endShift[0].id
				)[0];

				el.prev_value = +startMovment.total_prev_value;
				el.curr_value = +endMovment.total_curr_value;
				el.price = endMovment.price;
				el.income =
					incomes.filter((ele) => ele.movment_id === el.id)[0]?.total_amount ||
					0;
				el.others =
					others.filter((ele) => ele.movment_id === el.id)[0]?.total_amount ||
					0;
				el.branchWithdrawals =
					branchWithdrawals.filter((ele) => ele.movment_id === el.id)[0]
						?.total_amount || 0;
				el.incomeAndPrevValue = +el.income + +el.prev_value;
				el.cashSalesAmount =
					el.incomeAndPrevValue -
					+el.curr_value -
					el.others -
					+el.branchWithdrawals;
				el.cashSalesValue = el.cashSalesAmount * el.price;
				el.othersValue = el.others * el.price;
				el.branchWithdrawalsValue = el.branchWithdrawals * el.price;
				el.totalSpend = el.incomeAndPrevValue - +el.curr_value;
				el.stockTakingValue = stockTakingValue;
				el.final_value = +endMovment.total_curr_value + el.stockTakingValue;
			});
			res.status(200).json({
				info: {
					station_name: station[0].name,
					substance_name: stores[0]["substance.name"],
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
		await sequelize.transaction(async (t) => {
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
						attributes: ["id", "name"],
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
					[sequelize.fn("SUM", sequelize.col("amount")), "total_amount"],
					[sequelize.literal("SUM(price * amount)"), "total_value"],
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
					[sequelize.fn("SUM", sequelize.col("amount")), "total_amount"],
					[sequelize.literal("SUM(price * amount)"), "total_value"],
				],
				group: ["store_id"],
				raw: true,
				transaction: t,
			});
			const stockTaking = await StocktakingStoresMovmentsModel.findAll({
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
					[sequelize.literal("SUM(curr_value - prev_value)"), "total_amount"],
				],
				group: ["store_id"],
				raw: true,
				transaction: t,
			});

			const branchWithdrawals = await BranchWithdrawalsModel.findAll({
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
					[sequelize.fn("SUM", sequelize.col("amount")), "total_amount"],
					[sequelize.literal("SUM(price * amount)"), "total_value"],
				],
				group: ["store_id"],
				raw: true,
				transaction: t,
			});
			groupedstoresById.forEach((el) => {
				let total_cash = 0;
				el.data.forEach((ele) => {
					total_cash =
						total_cash + (+ele.prev_value - +ele.curr_value) * ele.price;
				});

				el.income =
					incomes.filter((ele) => ele.store_id === el.store_id)[0]
						?.total_amount || 0;
				el.income_value =
					incomes.filter((ele) => ele.store_id === el.store_id)[0]
						?.total_value || 0;

				el.others =
					others.filter((ele) => ele.store_id === el.store_id)[0]
						?.total_amount || 0;
				el.others_value =
					others.filter((ele) => ele.store_id === el.store_id)[0]
						?.total_value || 0;
				el.branchWithdrawals =
					branchWithdrawals.filter((ele) => ele.store_id === el.store_id)[0]
						?.total_amount || 0;
				el.branchWithdrawals_value =
					branchWithdrawals.filter((ele) => ele.store_id === el.store_id)[0]
						?.total_value || 0;
				el.stockTaking =
					stockTaking.filter((ele) => ele.store_id === el.store_id)[0]
						?.total_amount || 0;
				// el.othersAndBranchWithdrawals = +el.others + +el.branchWithdrawals;
				el.total_cash =
					total_cash -
					el.others_value +
					+el.income_value -
					el.branchWithdrawals_value;
				// el.incomeAndPrevValue;
				// (el.store = `${group.data[0]["store.name"]} - ${group.data[0]["store.substance.name"]}`),
				// 	(el.cashSalesAmount =
				// 		incomeAndPrevValue -
				// 		+maxDateData.curr_value -
				// 		total_others -
				// 		+total_branchWithdrawals);
			});

			// res.status(200).json({
			// 	stores: groupedstoresById,
			// });
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

				// const total_incomes =
				// 	incomes.filter((ele) => ele.store_id === store_id)[0]?.total_amount ||
				// 	0;
				// const total_others =
				// 	others.filter((ele) => ele.store_id === store_id)[0]?.total_amount ||
				// 	0;
				// const total_branchWithdrawals =
				// 	branchWithdrawals.filter((ele) => ele.store_id === store_id)[0]
				// 		?.total_amount || 0;
				// const total_incomes_value =
				// 	incomes.filter((ele) => ele.store_id === store_id)[0]?.total_value ||
				// 	0;
				// const total_others_value =
				// 	others.filter((ele) => ele.store_id === store_id)[0]?.total_value ||
				// 	0;
				// const total_branchWithdrawals_value =
				// 	branchWithdrawals.filter((ele) => ele.store_id === store_id)[0]
				// 		?.total_value || 0;

				// const incomeAndPrevValue = +total_incomes + +minDateData.prev_value;

				return {
					...maxDateData,
					prev_value: minDateData.prev_value,
					income: +group.income,
					others: +group.others,
					others_value: +group.others_value,
					branchWithdrawals: +group.branchWithdrawals,
					branchWithdrawals_value: +group.branchWithdrawals_value,
					othersAndbranchWithdrawalsAmount:
						+group.others + +group.branchWithdrawals,
					othersAndbranchWithdrawalsValue:
						+group.others_value + +group.branchWithdrawals_value,
					incomeAndPrevValue: +minDateData.prev_value + +group.income,
					store: `${group.data[0]["store.name"]} - ${group.data[0]["store.substance.name"]}`,
					cashSalesAmount:
						+minDateData.prev_value +
						+group.income -
						+maxDateData.curr_value -
						+group.others -
						+group.branchWithdrawals,
					total_cash: group.total_cash,
					// cashSalesValue:
					// 	incomeAndPrevValue -
					// 	+maxDateData.curr_value -
					// 	total_others -
					// 	+total_branchWithdrawals,
					// cashSalesValue = el.cashSalesAmount * el.price;
					// othersValue: total_others_value + total_branchWithdrawals_value,
					// branchWithdrawalsValue: total_branchWithdrawals_value,
					totalSpend:
						+minDateData.prev_value + +group.income - +maxDateData.curr_value,
					stockTaking: +group.stockTaking,
					final_value: +maxDateData.curr_value + +group.stockTaking,
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
		await sequelize.transaction(async (t) => {
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
		await sequelize.transaction(async (t) => {
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
			}
			if (req.query.type === "الحركة") {
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
		await sequelize.transaction(async (t) => {
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
			const result = Object.values(groupedData); // Convert the object to an array of groups
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
// exports.getDispensersMovmentInPeriod = catchAsync(async (req, res, next) => {
// 	try {
// 		await sequelize.transaction(async (t) => {
// 			const startMovment = await MovmentModel.findOne({
// 				where: {
// 					station_id: req.query.station,
// 					date: req.query.startDate,
// 				},
// 				raw: true,
// 				transaction: t,
// 			});

// 			const endMovment = await MovmentModel.findOne({
// 				where: {
// 					station_id: req.query.station,
// 					date: req.query.endDate,
// 				},
// 				raw: true,
// 				transaction: t,
// 			});
// 			if (!startMovment) {
// 				return next(
// 					new AppError(`لم يتم ادخال الحركة بتاريخ ${req.query.startDate}`, 500)
// 				);
// 			}
// 			if (!endMovment) {
// 				return next(
// 					new AppError(`لم يتم ادخال الحركة بتاريخ ${req.query.endDate}`, 500)
// 				);
// 			}

// 			const startDispenserMovment = await DispenserMovmentModel.findAll({
// 				where: {
// 					movment_id: startMovment.id,
// 					shift_number: 1,
// 					is_active: 1,
// 				},
// 				raw: true,
// 				include: [
// 					{
// 						model: DispenserModel,
// 						attributes: ["id", "number"],
// 						include: [
// 							{
// 								model: TankModel,
// 								attributes: ["id"],
// 								include: [
// 									{
// 										model: SubstanceModel,
// 										attributes: ["id", "name"],
// 									},
// 								],
// 							},
// 						],
// 					},
// 				],
// 				order: [[{ model: DispenserModel }, "number", "ASC"]],
// 				transaction: t,
// 			});
// 			const endDispenserMovment = await DispenserMovmentModel.findAll({
// 				where: {
// 					movment_id: endMovment.id,
// 					shift_number: endMovment.shifts,
// 					is_active: 1,
// 				},
// 				raw: true,
// 				include: [
// 					{
// 						model: DispenserModel,
// 						attributes: ["id", "number"],
// 						include: [
// 							{
// 								model: TankModel,
// 								attributes: ["id"],
// 								include: [
// 									{
// 										model: SubstanceModel,
// 										attributes: ["id", "name"],
// 									},
// 								],
// 							},
// 						],
// 					},
// 				],
// 				order: [[{ model: DispenserModel }, "number", "ASC"]],
// 				transaction: t,
// 			});

// 			startDispenserMovment.forEach((el) => {
// 				const endDispenser = endDispenserMovment.find(
// 					(ele) => ele.dispenser_id === el.dispenser_id
// 				);
// 				if (endDispenser) {
// 					el.curr_A = endDispenser.curr_A;
// 					el.curr_B = endDispenser.curr_B;
// 				}
// 			});

// 			const groupedDispensers = startDispenserMovment.reduce((acc, item) => {
// 				const existingGroup = acc.find(
// 					(group) => group.substance_id === item["dispenser.tank.substance.id"]
// 				);

// 				if (existingGroup) {
// 					existingGroup.data.push(item);
// 				} else {
// 					acc.push({
// 						title: `حركة عدادات ال${item["dispenser.tank.substance.name"]}`,
// 						substance_id: item["dispenser.tank.substance.id"],
// 						data: [item],
// 					});
// 				}

// 				return acc;
// 			}, []);
// 			groupedDispensers.forEach((el) => {
// 				let total = 0;
// 				el.data.forEach((ele) => {
// 					total = total + ele.curr_A - ele.prev_A + ele.curr_B - ele.prev_B;
// 					ele.total = total;
// 				});
// 			});

// 			const station = await StationModel.findAll({
// 				where: {
// 					id: req.query.station,
// 				},
// 				raw: true,
// 				transaction: t,
// 			});

// 			res.status(200).json({
// 				info: {
// 					station_name: station[0].name,
// 					fromDate: req.query.startDate,
// 					toDate: req.query.endDate,
// 				},
// 				dispensers: groupedDispensers,
// 			});
// 		});
// 	} catch (error) {
// 		return next(new AppError(error, 500));
// 	}
// });
exports.getMovmentReport = catchAsync(async (req, res, next) => {
	try {
		let dispensersMovment = [];
		let storesMovment = [];
		await sequelize.transaction(async (t) => {
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
		await sequelize.transaction(async (t) => {
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
			await sequelize.transaction(async (t) => {
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
								Sequelize.literal(
									"(curr_A - prev_A + curr_B - prev_B) * price"
								),
								"cash",
							],
							[
								Sequelize.literal("curr_A - prev_A + curr_B - prev_B"),
								"amount",
							],
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
							Sequelize.literal(
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
						include: [[Sequelize.literal("amount * price"), "cash"]],
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
						[Sequelize.literal("SUM(amount * price)"), "cash"], // This sums the amount * price
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
						include: [[Sequelize.literal("amount * price"), "cash"]],
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
						[Sequelize.literal("SUM(amount * price)"), "cash"], // This sums the amount * price
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
								Sequelize.literal(`CONCAT('مقابل توريد نقدي لصندوق المحطة')`),
								"statement",
							],
							[Sequelize.literal(`amount`), "creditor"],
							[Sequelize.literal(`0`), "debtor"],
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
					attributes: [[Sequelize.literal("SUM(amount)"), "cash"]],
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
// exports.getBoxAccountStatementReport = catchAsync(async (req, res, next) => {
// 	try {
// 		await sequelize.transaction(async (t) => {
// 			const startDate = new Date(req.query.startDate);
// 			const previousDay = new Date(startDate);
// 			previousDay.setDate(startDate.getDate() - 1);
// 			const deposits = await DepositModel.findAll({
// 				where: {
// 					station_id: +req.query.station,
// 					invoice_date: {
// 						[Op.between]: [req.query.startDate, req.query.endDate], // Assuming startDate and endDate are defined
// 					},
// 				},
// 				attributes: {
// 					include: [
// 						[Sequelize.literal(`amount`), "creditor"],
// 						[Sequelize.literal(`invoice_date`), "date"],
// 						[Sequelize.literal(0), "debtor"],
// 					],
// 				},
// 				transaction: t,
// 				raw: true,
// 			});
// 			// deposits.forEach((el) => {
// 			// 	el.date = el.invoice_date;
// 			// });
// 			const prevDeposits = await DepositModel.findAll({
// 				where: {
// 					station_id: req.query.station,
// 					invoice_date: {
// 						[Op.lt]: startDate,
// 					},
// 				},
// 				attributes: [[Sequelize.literal("SUM(amount)"), "cash"]],
// 				group: ["station_id"],
// 				transaction: t,
// 				raw: true,
// 			});
// 			const receives = await ReceivesModel.findAll({
// 				where: {
// 					station_id: req.query.station,
// 					date: {
// 						[Op.between]: [req.query.startDate, req.query.endDate], // Assuming startDate and endDate are defined
// 					},
// 				},
// 				attributes: {
// 					include: [
// 						[Sequelize.literal(`amount`), "debtor"],
// 						[Sequelize.literal(0), "creditor"],
// 					],
// 				},
// 				transaction: t,
// 				raw: true,
// 			});

// 			const prevReceives = await ReceivesModel.findAll({
// 				where: {
// 					station_id: req.query.station,
// 					date: {
// 						[Op.lt]: startDate,
// 					},
// 				},
// 				attributes: [[Sequelize.literal("SUM(amount)"), "cash"]],
// 				group: ["station_id"],
// 				transaction: t,
// 				raw: true,
// 			});

// 			const opening = [
// 				{
// 					date: previousDay,
// 					id: "-",
// 					statement: "رصيد سابق",
// 					debtor: +prevReceives[0]?.cash || 0,
// 					creditor: +prevDeposits[0]?.cash || 0,
// 					balance:
// 						(+prevDeposits[0]?.cash || 0) - (+prevReceives[0]?.cash || 0),
// 				},
// 			];

// 			const cash = opening.concat(deposits, receives);
// 			// Sort the combined array based on the date in ascending order
// 			let perioddebtor = 0;
// 			let periodcreditor = 0;
// 			cash.sort((a, b) => new Date(a.date) - new Date(b.date));

// 			cash.forEach((el, i) => {
// 				if (i !== 0) {
// 					perioddebtor = perioddebtor + el.debtor;
// 					periodcreditor = periodcreditor + el.creditor;
// 					el.balance = cash[i - 1].balance - el.debtor + el.creditor;
// 				}
// 			});
// 			const station = await StationModel.findOne({
// 				where: {
// 					id: +req.query.station,
// 				},
// 				transaction: t,
// 			});
//
// 			const final_statment =
// 				cash[cash.length - 1].balance > 0
// 					? `دائن ${tafqeet(
// 							Math.abs(cash[cash.length - 1].balance)
// 					  )} ريال فقط لا غير`
// 					: `مدين ${tafqeet(
// 							Math.abs(cash[cash.length - 1].balance)
// 					  )} ريال فقط لا غير`;
// 			res.status(200).json({
// 				state: "success",
// 				data: {
// 					cash,
// 					info: {
// 						station_name: station.name,
// 						startDate: req.query.startDate,
// 						endDate: req.query.endDate,
// 						perioddebtor,
// 						periodcreditor,
// 						final_statment,
// 						name: "الصندوق",
// 					},
// 				},
// 			});
// 		});
// 	} catch (error) {
// 		return next(new AppError(error, 500));
// 	}
// });
exports.getStationAccountStatementReport = catchAsync(
	async (req, res, next) => {
		try {
			await sequelize.transaction(async (t) => {
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
				//حساب جانب الدائن
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
							[Sequelize.literal(`amount * price`), "debtor"],
							[Sequelize.literal(0), "creditor"],
							[Sequelize.col("movment.date"), "date"],
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
						[Sequelize.literal("SUM(price * amount)"), "debtor"], // Sum of price * amount
						[Sequelize.literal(0), "creditor"],
					],
					include: [
						{
							model: StoreModel,
							attributes: [],
							where: {
								type: "نقدي",
							},
							required: true, // Ensures that only records with matching type are included
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
							[Sequelize.literal(`amount * price`), "debtor"],
							[Sequelize.literal(0), "creditor"],
							[Sequelize.col("movment.date"), "date"],
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
						[Sequelize.literal("SUM(price * amount)"), "debtor"],
						[Sequelize.literal(0), "creditor"],
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
							[Sequelize.literal(`amount`), "creditor"],
							[Sequelize.literal(0), "debtor"],
							[Sequelize.col("invoice_date"), "date"],
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
						[Sequelize.literal("SUM(amount)"), "creditor"],
						[Sequelize.literal(0), "debtor"],
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
						debtor: (+prevIncomes[0]?.debtor || 0) + (+prevSurplus.debtor || 0),
						creditor: +prevDeposits[0]?.creditor || 0,
						balance:
							(+prevDeposits[0]?.creditor || 0) -
							(+prevIncomes[0]?.debtor || 0) +
							(+prevSurplus.debtor || 0),
					},
				];
				// حساب فوارق التسعيرة
				const priceMovmentEntries = await priceMovmentEntriesModel.findAll({
					where: {
						station_id: req.query.station,
						date: {
							[Op.gte]: startDate,
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
				const cash = opening.concat(
					deposits,
					surplus,
					incomes,
					priceMovmentEntries
				);

				//ترتيب حسب التاريخ
				let perioddebtor = 0;
				let periodcreditor = 0;
				cash.sort((a, b) => new Date(a.date) - new Date(b.date));
				cash.forEach((el, i) => {
					if (i !== 0) {
						perioddebtor = perioddebtor + el.debtor;
						periodcreditor = periodcreditor + +el.creditor;
						el.balance = cash[i - 1].balance - el.debtor + el.creditor;
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
		await sequelize.transaction(async (t) => {
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
						[Sequelize.literal(`amount`), "debtor"],
						[Sequelize.literal(0), "creditor"],
						[Sequelize.col("invoice_date"), "date"],
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
					[Sequelize.literal("SUM(amount)"), "creditor"],
					[Sequelize.literal(0), "debtor"],
				],
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
					// 	Sequelize.literal(
					// 		"SUM((curr_A + curr_B - prev_A - prev_B) * price)"
					// 	),
					// 	"creditor",
					// ],
					[
						Sequelize.literal("SUM(curr_A + curr_B - prev_A - prev_B)"),
						"amount",
					],
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
						Sequelize.literal(
							"SUM((curr_A - prev_A + curr_B - prev_B) * price)"
						),
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
					[Sequelize.fn("SUM", Sequelize.col("amount")), "total_amount"],
					[Sequelize.literal("SUM(amount * price)"), "total_cash"],
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
					[Sequelize.literal("SUM(amount * price)"), "cash"], // This sums the amount * price
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
					[Sequelize.fn("SUM", Sequelize.col("amount")), "total_amount"],
					[Sequelize.literal("SUM(amount * price)"), "total_cash"],
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
					[Sequelize.literal("SUM(amount * price)"), "cash"], // This sums the amount * price
				],
				group: ["station_id"],
				transaction: t,
				raw: true,
			});
			// حساب المبيعات النقدية فقط
			dispensers.forEach((dispenser) => {
				const other = othersCash.filter(
					(el) => el["movment.id"] === dispenser["movment.id"]
				)[0];
				const branchWithdrawals = branchWithdrawalsCash.filter(
					(el) => el["movment.id"] === dispenser["movment.id"]
				)[0];
				if (other) {
					dispenser.creditor = +dispenser.creditor - +other.total_cash;

					dispenser.amount = +dispenser.amount - +other.total_amount;
				}
				if (branchWithdrawals) {
					dispenser.creditor =
						+dispenser.creditor - +branchWithdrawals.total_cash;
					dispenser.amount =
						+dispenser.amount - +branchWithdrawals.total_amount;
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
						(+prevBranchWithdrawalsCash.cash || 0) -
						(+prevOthersCash.cash || 0),
					creditor: +prevDeposits[0]?.creditor || 0,
					balance:
						(+prevDispensersCash[0]?.cash || 0) -
						(+prevBranchWithdrawalsCash.cash || 0) -
						(+prevOthersCash.cash || 0) -
						(+prevDeposits[0]?.creditor || 0),
				},
			];
			//ترتيب حسب التاريخ
			const cash = opening.concat(dispensers, deposits);

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
						name: "الصندوق",
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
		await sequelize.transaction(async (t) => {
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
		console.log(error);
		return next(new AppError(error, 500));
	}
});
exports.getOverview = catchAsync(async (req, res, next) => {
	try {
		await sequelize.transaction(async (t) => {
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
						include: [{ model: StationModel, attributes: ["name", "number"] }],
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
								movment_id: movement.id,
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
				console.log(`now`, now);
				console.log(`movementDate`, movementDate);
				const diffTime = Math.abs(now - movementDate);
				const diffDays = diffTime / (1000 * 60 * 60 * 24);
				console.log(`diffDays`, diffDays);
				el.isUpToDate = diffDays <= 2;
			});

			res.status(200).json({
				state: "success",
				stations: latestMovementDetails,
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
