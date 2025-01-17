const catchAsync = require("../utils/catchAsync");
const MovmentModel = require("./../models/movmentModel");
const sequelize = require("./../connection");
const AppError = require("../utils/appError");
const StationModel = require("../models/stationModel");
const DispenserMovmentModel = require("../models/dispenserMovmentModel");
const IncomeModel = require("../models/incomeModel");
const StoreMovmentModel = require("../models/storeMovmentModel");
const OtherModel = require("../models/otherModel");
const { Sequelize } = require("sequelize");
const StoreModel = require("../models/storeModel");
const SubstanceModel = require("../models/substanceModel");
const DispenserModel = require("../models/dispenserModel");
const TankModel = require("../models/tankModel");
const calibrationModel = require("../models/calibrationModel");
const calibrationMemberModel = require("../models/calibrationMemberModel");
const StoresTransferModel = require("../models/storesTransferModel");
const SurplusModel = require("../models/surplusModel");
const BranchWithdrawalsModel = require("../models/branchWithdrawalsModel");

exports.getAllMovments = catchAsync(async (req, res, next) => {
	try {
		const movments = await MovmentModel.findAll({
			where: {
				station_id: {
					[Sequelize.Op.in]: req.stations,
				},
			},
			raw: true,
			include: [
				{
					model: StationModel,
					attributes: ["name"],
				},
			],
			limit: +req.query.limit,
			offset: +req.query.limit * +req.query.page,
		});
		const movmentsIds = movments.map((el) => el.id);

		const movmentsTotal = await MovmentModel.findAll({});
		const dispensersMovments = await DispenserMovmentModel.findAll({
			where: {
				movment_id: {
					[Sequelize.Op.in]: movmentsIds,
				},
			},
		});
		const groupedData = dispensersMovments.reduce((acc, item) => {
			const key = item.movment_id;
			if (!acc[key]) {
				acc[key] = new Set();
			}
			acc[key].add(item.shift_number);
			return acc;
		}, {});
		const transformedData = Object.keys(groupedData).map((key) => {
			return {
				movment_id: parseInt(key),
				shifts: Array.from(groupedData[key]),
			};
		});

		const movmentAr = movments.map((el) => {
			return {
				...el,
				insertedShifts:
					transformedData.filter((ele) => ele.movment_id === el.id)[0]
						?.shifts || [],
			};
		});

		res.status(200).json({
			state: "success",
			movments: movmentAr,
			total: movmentsTotal.length,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getMovmentsByStationId = catchAsync(async (req, res, next) => {
	try {
		const movments = await MovmentModel.findAll({
			where: {
				station_id: req.params.id,
			},
		});
		res.status(200).json({
			state: "success",
			movments,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getStationMovment = catchAsync(async (req, res, next) => {
	try {
		await sequelize.transaction(async (t) => {
			const movment = await MovmentModel.findOne({
				where: {
					station_id: +req.params.station_id,
					number: +req.params.movment_number,
				},
				order: [["createdAt", "DESC"]],
				transaction: t,
			});

			res.status(200).json({
				state: "success",
				movment,
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});

exports.getStationMovmentByDate = catchAsync(async (req, res, next) => {
	try {
		await sequelize.transaction(async (t) => {
			const movment = await MovmentModel.findOne({
				where: {
					station_id: +req.params.id,
					date: req.params.date,
					state: "approved",
				},
				order: [["createdAt", "DESC"]],
				transaction: t,
			});

			res.status(200).json({
				state: "success",
				movment,
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getStationPendingMovment = catchAsync(async (req, res, next) => {
	try {
		const pendingMovment = await MovmentModel.findAll({
			where: { station_id: +req.params.id, state: "pending" },
			order: [["createdAt", "DESC"]],
		});
		res.status(200).json({
			state: "success",
			pendingMovment,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.addMovment = catchAsync(async (req, res, next) => {
	const currDate = new Date(req.body.date);
	const previousDay = new Date(currDate);
	previousDay.setDate(currDate.getDate() - 1);
	try {
		const station = await StationModel.findOne({
			where: {
				id: req.body.station_id,
			},
		});
		//check currMomvnet
		const currMomvnet = await MovmentModel.findOne({
			where: {
				station_id: req.body.station_id,
				date: req.body.date,
			},
		});
		if (currMomvnet) {
			return next(new AppError(`تم ادخال الحركة بتاريخ ${req.body.date}`));
		}
		//check prevMomvnet
		const checkPendingMovment = await MovmentModel.findOne({
			where: { station_id: +req.body.station_id, state: "pending" },
			order: [["createdAt", "DESC"]],
		});

		if (checkPendingMovment) {
			return next(new AppError("لم يتم تأكيد حركة اليوم السابق", 500));
		}
		const prevMovment = await MovmentModel.findOne({
			where: {
				station_id: req.body.station_id,
				date: previousDay,
				state: "approved",
			},
			order: [["createdAt", "DESC"]],
		});

		if (!prevMovment) {
			return next(new AppError("لم يتم ادخال حركة اليوم السابق", 500));
		}

		await MovmentModel.create({
			station_id: req.body.station_id,
			date: req.body.date,
			number: req.body.number,
			shifts: station.shifts,
			state: "pending",
		});
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error.errors[0].message, 500));
	}
});
exports.addShiftMovment = catchAsync(async (req, res, next) => {
	try {
		await sequelize.transaction(async (t) => {
			const incomesArr = req.body.incomes.map((el) => {
				return {
					amount: +el.amount,
					substance_id: +el.substance.id,
					station_id: +req.body.station_id,
					store_id: +el.store,
					truck_number: el.truck,
					truck_driver: el.driver,
					shift_number: req.body.shift.number,
					start: req.body.shift.start,
					end: req.body.shift.end,
					type: el.type,
					movment_id: +req.body.movment_id,
					price: el.substance.price,
				};
			});
			await IncomeModel.bulkCreate(incomesArr, {
				transaction: t,
			});

			const dispensersMovmentsArr = req.body.dispensers.map((el) => {
				return {
					prev_A: +el.prev_A,
					prev_B: +el.prev_B,
					curr_A: +el.curr_A,
					curr_B: +el.curr_B,
					start: req.body.shift.start,
					end: req.body.shift.end,
					shift_number: req.body.shift.number,
					tank_id: el.dispenser.tank.id,
					dispenser_id: +el.dispenser.id,
					movment_id: +req.body.movment_id,
					station_id: +req.body.station_id,
					price: el.dispenser.tank.substance.price,
				};
			});

			await DispenserMovmentModel.bulkCreate(dispensersMovmentsArr, {
				transaction: t,
			});

			const storesMovmentsArr = req.body.currStoresMovments.map((el) => {
				return {
					prev_value: el.prev_value,
					curr_value: el.curr_value,
					store_id: el.store.id,
					date: req.body.date,
					shift_number: req.body.shift.number,
					start: req.body.shift.start,
					end: req.body.shift.end,
					movment_id: +req.body.movment_id,
					station_id: +req.body.station_id,
					price: el.store.substance.price,
				};
			});
			const storesMovments = await StoreMovmentModel.bulkCreate(
				storesMovmentsArr,
				{ transaction: t }
			);

			const othersArr = req.body.others.map((el) => {
				return {
					store_id: el.store,
					movment_id: +req.body.movment_id,
					station_id: +req.body.station_id,
					amount: el.amount,
					title: el.title,
					shift_number: req.body.shift.number,
					start: req.body.shift.start,
					end: req.body.shift.end,
					type: el.type,
					price: el.substance.price,
				};
			});
			await OtherModel.bulkCreate(othersArr, { transaction: t });

			const storesTransfaresArr = req.body.storesTransfer.map((el) => {
				return {
					station_id: +req.body.station_id,
					movment_id: +req.body.movment_id,
					from_store_id: el.from_store,
					to_store_id: el.to_store,
					amount: +el.amount,
					shift_number: req.body.shift.number,
					start: req.body.shift.start,
					end: req.body.shift.end,
					price: el.from_substance.price,
				};
			});

			await StoresTransferModel.bulkCreate(storesTransfaresArr, {
				transaction: t,
			});

			const branchWithdrawalsArr = req.body.coupons.map((el) => {
				return {
					station_id: +req.body.station_id,
					movment_id: +req.body.movment_id,
					shift_number: req.body.shift.number,
					store_id: el.store,
					store_movment_id: storesMovments.filter(
						(ele) => ele.store_id === el.store
					)[0].id,
					amount: +el.amount,
					type: el.type,
					start: req.body.shift.start,
					end: req.body.shift.end,
					price: el.substance.price,
				};
			});
			await BranchWithdrawalsModel.bulkCreate(branchWithdrawalsArr, {
				transaction: t,
			});
			const surplusArr = req.body.surplus.map((el) => {
				return {
					station_id: +req.body.station_id,
					movment_id: +req.body.movment_id,
					shift_number: req.body.shift.number,
					store_id: el.store,
					amount: +el.amount,
					start: req.body.shift.start,
					end: req.body.shift.end,
					price: el.substance.price,
				};
			});
			await SurplusModel.bulkCreate(surplusArr, {
				transaction: t,
			});
			const calibrationsArr = req.body.calibrations.map((el) => {
				return {
					store_id: el.store,
					movment_id: +req.body.movment_id,
					station_id: +req.body.station_id,
					amount: el.amount,
					shift_number: req.body.shift.number,
					start: req.body.shift.start,
					end: req.body.shift.end,
					price: el.substance.price,
				};
			});
			const addedCalibrations = await calibrationModel.bulkCreate(
				calibrationsArr,
				{ transaction: t }
			);
			let calibrationMembersArr = [];
			req.body.calibrationMembers.forEach((el) => {
				addedCalibrations.forEach((ele) => {
					calibrationMembersArr.push({
						calibration_id: ele.id,
						name: el.name,
					});
				});
			});
			await calibrationMemberModel.bulkCreate(calibrationMembersArr, {
				transaction: t,
			});
		});
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error.errors[0].message, 500));
	}
});
exports.deleteMovment = catchAsync(async (req, res, next) => {
	try {
		await MovmentModel.destroy({
			where: {
				id: req.params.id,
			},
		});
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		console.log(`error`, error);
		return next(new AppError(error, 500));
	}
});
exports.changeMovmentState = catchAsync(async (req, res, next) => {
	try {
		if (req.body.state === "pending") {
			//check pending movment
			const checkPendingMovment = await MovmentModel.findOne({
				where: { station_id: req.body.station_id, state: "pending" },
				order: [["createdAt", "DESC"]],
			});
			if (checkPendingMovment) {
				return next(new AppError("لا يمكن فتح أكثر من حركة بنفس الوقت", 500));
			}
		}

		await MovmentModel.update(
			{ state: req.body.state },
			{ where: { id: +req.params.id } }
		);
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
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
