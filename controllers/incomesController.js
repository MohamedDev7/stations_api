const catchAsync = require("../utils/catchAsync");
const IncomeModel = require("./../models/incomeModel");
const AppError = require("../utils/appError");
const StoreMovmentModel = require("../models/storeMovmentModel");
const sequelize = require("./../connection");
const TankMovmentModel = require("../models/tankMovmentModel");
const StationModel = require("../models/stationModel");
const MovmentModel = require("../models/movmentModel");
const StoreModel = require("../models/storeModel");
const SubstanceModel = require("../models/substanceModel");
const { Sequelize, Op } = require("sequelize");
const MovmentsShiftsModel = require("../models/movmentsShiftsModel");

exports.getAllIncomes = catchAsync(async (req, res, next) => {
	try {
		const incomes = await IncomeModel.findAll({
			where: {
				station_id: {
					[Sequelize.Op.in]: req.stations,
				},
			},
			include: [
				{
					model: StationModel,
					attributes: ["name"],
				},
				{
					model: MovmentModel,
					attributes: ["date"],
				},
				{
					model: StoreModel,
					attributes: ["id", "name"],
					include: [
						{
							model: SubstanceModel,
							attributes: ["name"],
						},
					],
				},
			],
			order: [["createdAt", "DESC"]],
			limit: +req.query.limit,
			offset: +req.query.limit * +req.query.page,
		});
		const total = await IncomeModel.count({
			where: {
				station_id: {
					[Sequelize.Op.in]: req.stations,
				},
			},
		});
		res.status(200).json({
			state: "success",
			incomes,
			total,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getIncomesByMovmentIdAndShiftId = catchAsync(async (req, res, next) => {
	try {
		const incomes = await IncomeModel.findAll({
			where: {
				movment_id: req.params.movment_id,
				shift_id: req.params.shift_id,
			},
			include: [
				{
					model: StoreModel,
					attributes: ["id"],
					include: [
						{
							model: SubstanceModel,
							attributes: ["id"],
						},
					],
				},
			],
			order: [["createdAt", "DESC"]],
		});

		res.status(200).json({
			state: "success",
			incomes,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.addIncome = catchAsync(async (req, res, next) => {
	try {
		await sequelize.transaction(async (t) => {
			// check if there is momvnets or shifts after
			const currMovment = await MovmentModel.findByPk(req.body.movmentId, {
				raw: true,
			});
			const nextMovments = await MovmentModel.findAll({
				where: {
					date: {
						[Op.gt]: currMovment.date,
					},
				},
			});
			const nextMovmentsIds = nextMovments.map((el) => el.id);
			const nextShifts = await MovmentsShiftsModel.findAll({
				where: {
					movment_id: req.body.movmentId,
					number: {
						[Op.gt]: +req.body.shift.number,
					},
				},
			});

			const nextShiftsIds = nextShifts.map((el) => el.id);
			const nextShiftsStoreMovments = await StoreMovmentModel.findAll({
				where: {
					movment_id: req.body.movmentId,
					store_id: req.body.store.id,
					shift_id: {
						[Op.in]: nextShiftsIds,
					},
				},
				raw: true,
			});
			const nextShiftsStoreMovmentsIds = nextShiftsStoreMovments.map(
				(el) => el.id
			);
			const nextMovmentsStoreMovments = await StoreMovmentModel.findAll({
				where: {
					movment_id: { [Op.in]: nextMovmentsIds },
				},
				raw: true,
			});
			const nextMovmentsStoreMovmentsIds = nextMovmentsStoreMovments.map(
				(el) => el.id
			);

			const currShiftStoreMovments = await StoreMovmentModel.findAll({
				where: {
					movment_id: req.body.movmentId,
					store_id: req.body.store.id,
					shift_id: +req.body.shift.id,
				},
				raw: true,
			});
			if (currShiftStoreMovments.length > 0) {
				await StoreMovmentModel.update(
					{
						curr_value: sequelize.literal(`curr_value + ${req.body.amount}`),
					},
					{
						where: {
							id: currShiftStoreMovments[0].id,
						},
						transaction: t,
					}
				);
			}
			if (nextShiftsStoreMovments.length > 0) {
				await StoreMovmentModel.update(
					{
						curr_value: sequelize.literal(`curr_value + ${req.body.amount}`),
						prev_value: sequelize.literal(`prev_value + ${req.body.amount}`),
					},
					{
						where: {
							id: {
								[Op.in]: nextShiftsStoreMovmentsIds,
							},
						},
						transaction: t,
					}
				);
			}
			if (nextMovmentsStoreMovments.length > 0) {
				await StoreMovmentModel.update(
					{
						curr_value: sequelize.literal(`curr_value + ${req.body.amount}`),
						prev_value: sequelize.literal(`prev_value + ${req.body.amount}`),
					},
					{
						where: {
							id: {
								[Op.in]: nextMovmentsStoreMovmentsIds,
							},
						},
						transaction: t,
					}
				);
			}
			await IncomeModel.create(
				{
					station_id: +req.body.station,
					amount: +req.body.amount,
					store_id: req.body.store.id,
					// substance_id: +req.body.substance,
					movment_id: req.body.movmentId,
					employee_id: +req.body.employee,
					truck_number: req.body.truckNumber,
					truck_driver: req.body.truckDriver,
					shift_id: +req.body.shift.id,
					type: "income",
					price: req.body.store.price,
					doc_number: req.body.docNumber,
					doc_amount: req.body.docAmount,
					from: req.body.from,
					state: "pending",
				},
				{ transaction: t }
			);
			res.status(200).json({
				state: "success",
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});

exports.deleteIncome = catchAsync(async (req, res, next) => {
	try {
		await sequelize.transaction(async (t) => {
			// check income state
			const income = await IncomeModel.findByPk(req.params.id);
			if (income.state === "approved") {
				return next(new AppError("لا يمكن حذف الوارد", 500));
			}
			await IncomeModel.destroy({
				where: {
					id: req.params.id,
				},
			});
			res.status(200).json({
				state: "success",
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
