const catchAsync = require("../utils/catchAsync");
const DispenserMovmentModel = require("./../models/dispenserMovmentModel");
const MovmentModel = require("./../models/movmentModel");
const AppError = require("../utils/appError");
const sequelize = require("./../connection");
const TankModel = require("../models/tankModel");
const DispenserModel = require("../models/dispenserModel");
const ShiftModel = require("../models/shiftModel");
const SubstanceModel = require("../models/substanceModel");
const SubstancePriceMovmentModel = require("../models/substancePriceMovmentModel");
// exports.getDispensersByStationId = catchAsync(async (req, res, next) => {
// 	try {
// 		const dispensers = await DispenserMovmentModel.findAll({
// 			where: {
// 				station_id: req.params.id,
// 			},
// 		});
// 		res.status(200).json({
// 			state: "success",
// 			dispensers,
// 		});
// 	} catch (error) {
// 		return next(new AppError(error, 500));
// 	}
// });
exports.getDispensersMovmentByMovmentIdAndShiftNumber = catchAsync(
	async (req, res, next) => {
		try {
			await sequelize.transaction(async (t) => {
				const dispensersMovments = await DispenserMovmentModel.findAll({
					where: {
						movment_id: +req.params.id,
						shift_number: +req.params.shiftNumber,
					},
					attributes: [
						"id",
						"curr_A",
						"curr_B",
						"movment_id",
						"prev_A",
						"prev_B",
					],
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
				});
				res.status(200).json({
					state: "success",
					dispensersMovments,
				});
			});
		} catch (error) {
			return next(new AppError(error, 500));
		}
	}
);
