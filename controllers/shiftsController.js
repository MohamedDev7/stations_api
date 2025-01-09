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
exports.getShiftsByMovmentId = catchAsync(async (req, res, next) => {
	try {
		const shifts = await ShiftModel.findAll({
			where: {
				movment: req.params.id,
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
exports.getShiftDataByMovmentIdAndShiftNumber = catchAsync(
	async (req, res, next) => {
		try {
			await sequelize.transaction(async (t) => {
				const dispensersMovment = await DispenserMovmentModel.findAll({
					where: {
						movment_id: req.params.id,
						shift_number: req.params.shift,
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
											attributes: ["name"],
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
						shift_number: req.params.shift,
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
				const incomes = await IncomeModel.findAll({
					where: {
						movment_id: req.params.id,
						shift_number: req.params.shift,
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
						shift_number: req.params.shift,
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
				});
			});
		} catch (error) {
			return next(new AppError(error, 500));
		}
	}
);
