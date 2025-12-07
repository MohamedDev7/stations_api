const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { getModel } = require("../utils/modelSelect");

exports.getStateByMonth = catchAsync(async (req, res, next) => {
	try {
		const StationModel = getModel(req.headers["x-year"], "station");
		const stationsClosedMonthModel = getModel(
			req.headers["x-year"],
			"stations_closed_month"
		);
		const stations = await StationModel.findAll({
			raw: true,
			order: [["number", "ASC"]],
		});
		const months = await stationsClosedMonthModel.findAll({
			where: { month: +req.params.month },
			include: [
				{
					model: StationModel,
					attributes: ["id"],
				},
			],
			raw: true,
		});

		stations.forEach((station) => {
			const month = months.find((el) => el.station_id === station.id);

			station.isClosed = month ? month.isClosed : 0;
		});

		res.status(200).json({
			state: "success",
			stations,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.changeState = catchAsync(async (req, res, next) => {
	const { stations, month, isClosed } = req.body;

	if (stations.length === 0 || !month) {
		return next(new AppError("الرجاء تمرير قائمة المحطات والشهر صحيح", 400));
	}
	try {
		const stationsClosedMonthModel = getModel(
			req.headers["x-year"],
			"stations_closed_month"
		);
		const promises = stations.map(async (station_id) => {
			const [record, created] = await stationsClosedMonthModel.findOrCreate({
				where: { station_id, month },
				defaults: { isClosed },
			});

			// Update only if value is different
			if (!created && record.isClosed !== isClosed) {
				record.isClosed = isClosed;
				await record.save();
			}
		});

		await Promise.all(promises);

		res.status(200).json({
			status: "success",
			message: "تم تحديث حالة الإغلاق للمحطات المحددة",
		});
	} catch (error) {
		return next(new AppError(error.message || error, 500));
	}
});
