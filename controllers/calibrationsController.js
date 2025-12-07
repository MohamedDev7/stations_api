const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sequelize = require("./../connection");
const { getModel } = require("../utils/modelSelect");
const { Sequelize, Op } = require("sequelize");
exports.getAllCalibrations = catchAsync(async (req, res, next) => {
	const CalibrationReportModel = getModel(
		req.headers["x-year"],
		"calibration_report"
	);
	const StationModel = getModel(req.headers["x-year"], "station");
	const MovmentModel = getModel(req.headers["x-year"], "movment");

	try {
		const calibrations = await CalibrationReportModel.findAll({
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
			],
			order: [["createdAt", "DESC"]],
		});
		res.status(200).json({
			state: "success",
			calibrations,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});

exports.getCalibrationsByMovmentIdAndShiftId = catchAsync(
	async (req, res, next) => {
		const CalibrationReportModel = getModel(
			req.headers["x-year"],
			"calibration_report"
		);
		const CalibrationModel = getModel(req.headers["x-year"], "calibration");
		const StoreModel = getModel(req.headers["x-year"], "store");
		const SubstanceModel = getModel(req.headers["x-year"], "substance");

		try {
			const calibrationReport = await CalibrationReportModel.findOne({
				where: {
					movment_id: req.params.movment_id,
					shift_id: req.params.shift_id,
				},
			});
			let calibrations = [];
			if (calibrationReport) {
				calibrations = await CalibrationModel.findAll({
					where: {
						calibration_report_id: calibrationReport.id,
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
			}

			res.status(200).json({
				state: "success",
				calibrations,
			});
		} catch (error) {
			return next(new AppError(error, 500));
		}
	}
);
exports.addCalibration = catchAsync(async (req, res, next) => {
	try {
		const CalibrationReportModel = getModel(
			req.headers["x-year"],
			"calibration_report"
		);
		const CalibrationModel = getModel(req.headers["x-year"], "calibration");
		const CalibrationMemberModel = getModel(
			req.headers["x-year"],
			"calibration_member"
		);
		await req.db.transaction(async (t) => {
			const calibrationReport = await CalibrationReportModel.create(
				{
					station_id: +req.body.station,
					movment_id: req.body.movmentId,
					shift_id: +req.body.shift.id,
				},
				{ transaction: t }
			);
			const calibrationArr = req.body.groupedDispensers.map((el) => {
				return {
					station_id: +req.body.station,
					amount: +el.totalLiters,
					store_id: +el.store_id,
					movment_id: req.body.movmentId,
					price: +el.price,
					prev_A: +el.prev_A,
					prev_B: +el.prev_B,
					curr_A: +el.curr_A,
					curr_B: +el.curr_B,
					calibration_report_id: calibrationReport.id,
					dispenser_id: +el.id,
				};
			});

			const calibration = await CalibrationModel.bulkCreate(calibrationArr, {
				transaction: t,
			});
			const calibrationMembersArr = req.body.members.map((el) => {
				return { calibration_report_id: calibrationReport.id, name: el.name };
			});
			await CalibrationMemberModel.bulkCreate(calibrationMembersArr, {
				transaction: t,
			});
			res.status(200).json({
				state: "success",
				calibration,
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.deleteCalibrationReport = catchAsync(async (req, res, next) => {
	const CalibrationReportModel = getModel(
		req.headers["x-year"],
		"calibration_report"
	);
	try {
		await CalibrationReportModel.destroy({
			where: { id: req.params.id },
		});
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
