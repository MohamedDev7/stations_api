const catchAsync = require("../utils/catchAsync");
const ShiftModel = require("./../models/shiftModel");
const AppError = require("../utils/appError");
const DispenserMovmentModel = require("../models/dispenserMovmentModel");
const DispenserModel = require("../models/dispenserModel");
const TankModel = require("../models/tankModel");
const SubstanceModel = require("../models/substanceModel");
const StoreMovmentModel = require("../models/storeMovmentModel");
const StoreModel = require("../models/storeModel");
const OtherModel = require("../models/otherModel");
const IncomeModel = require("../models/incomeModel");
const sequelize = require("./../connection");
const BranchWithdrawalsModel = require("../models/branchWithdrawalsModel");
const MovmentModel = require("../models/movmentModel");
const { Op } = require("sequelize");
const MovmentsShiftsModel = require("../models/movmentsShiftsModel");

exports.getShiftsByStationId = catchAsync(async (req, res, next) => {
	try {
		const shifts = await ShiftModel.findAll({
			where: {
				station_id: req.params.id,
			},
		});
		res.status(200).json({
			state: "success",
			shifts,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getLastShiftIdByMovmentId = catchAsync(async (req, res, next) => {
	try {
		const movment = await MovmentModel.findByPk(+req.params.id);
		const lastShift = await MovmentsShiftsModel.findOne({
			where: {
				movment_id: req.params.id,
				number: movment.shifts,
			},
		});

		res.status(200).json({
			state: "success",
			lastShift,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getMovmentsShiftsByMovmentId = catchAsync(async (req, res, next) => {
	try {
		const shifts = await MovmentsShiftsModel.findAll({
			where: {
				movment_id: req.params.id,
			},
		});
		res.status(200).json({
			state: "success",
			shifts,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.deleteShiftBYMovmentIdAndShiftId = catchAsync(
	async (req, res, next) => {
		try {
			await sequelize.transaction(async (t) => {
				//check no shifts after
				const movment = await MovmentModel.findByPk(req.params.id, {
					raw: true,
				});
				const check1 = await MovmentModel.findAll({
					where: {
						station_id: movment.station_id,
						date: {
							[Op.gt]: movment.date,
						},
					},
				});
				const currShift = MovmentsShiftsModel.findByPk(+req.params.shift);
				const check2 = await MovmentsShiftsModel.findAll({
					where: {
						movment_id: req.params.id,
						number: {
							[Op.gt]: currShift.number,
						},
					},
					transaction: t,
				});

				if (check1.length > 0 || check2.length > 0) {
					return next(new AppError("لا يمكن حذف هذه المناوبة", 500));
				}

				await MovmentsShiftsModel.update(
					{ state: "inserted" },
					{
						where: {
							id: req.params.shift,
						},
						transaction: t,
					}
				);
				await StoreMovmentModel.destroy({
					where: {
						movment_id: +req.params.id,
						shift_id: +req.params.shift,
					},
					transaction: t,
				});
				await DispenserMovmentModel.destroy({
					where: {
						movment_id: +req.params.id,
						shift_id: +req.params.shift,
					},
					transaction: t,
				});
				// await IncomeModel.destroy({
				// 	where: {
				// 		movment: req.params.id,
				// 		shift_number: req.params.shift,
				// 	},
				// 	transaction: t,
				// });
				await BranchWithdrawalsModel.destroy({
					where: {
						movment_id: +req.params.id,
						shift_id: +req.params.shift,
					},
					transaction: t,
				});
				await OtherModel.destroy({
					where: {
						movment_id: +req.params.id,
						shift_id: +req.params.shift,
					},
					transaction: t,
				});
				res.status(200).json({
					state: "success",
				});
			});
		} catch (error) {
			return next(new AppError(error, 500));
		}
	}
);
exports.getShiftDataByMovmentIdAndShiftId = catchAsync(
	async (req, res, next) => {
		console.log("req.params.shift", req.params.shift);
		try {
			await sequelize.transaction(async (t) => {
				const dispensersMovment = await DispenserMovmentModel.findAll({
					where: {
						movment_id: req.params.id,
						shift_id: req.params.shift,
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

				dispensersMovment.forEach((el) => {
					el.totalLiters = el.curr_A - el.prev_A + el.curr_B - el.prev_B;
				});

				const storesMovment = await StoreMovmentModel.findAll({
					where: {
						movment_id: req.params.id,
						shift_id: req.params.shift,
					},
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
					// raw: true,
					transaction: t,
				});
				// const incomes = await IncomeModel.findAll({
				// 	where: {
				// 		movment_id: req.params.id,
				// 		shift_number: req.params.shift,
				// 	},
				// 	include: [
				// 		{
				// 			model: StoreModel,
				// 			attributes: ["name"],
				// 			include: [
				// 				{
				// 					model: SubstanceModel,
				// 					attributes: ["name"],
				// 				},
				// 			],
				// 		},
				// 	],
				// 	transaction: t,
				// });
				const others = await OtherModel.findAll({
					where: {
						movment_id: req.params.id,
						shift_id: req.params.shift,
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
				});
				const coupons = await BranchWithdrawalsModel.findAll({
					where: {
						movment_id: req.params.id,
						shift_id: req.params.shift,
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
				});

				res.status(200).json({
					state: "success",
					storesMovment,
					dispensersMovment,
					coupons,
					others,
				});
			});
		} catch (error) {
			return next(new AppError(error, 500));
		}
	}
);
