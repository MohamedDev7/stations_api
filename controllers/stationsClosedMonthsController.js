const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { getModel } = require("../utils/modelSelect");

exports.getStationsState = catchAsync(async (req, res, next) => {
	try {
		const stationsClosedMonthModel = getModel(
			req.year,
			"stations_closed_month",
		);
		const StationModel = getModel(req.year, "station");

		// 1) كل المحطات (أساس الإخراج)
		const stations = await StationModel.findAll({
			attributes: ["id", "name", "number"],
			order: [["number", "ASC"]],
			raw: true,
		});

		// 2) كل بيانات الإغلاق (قد تكون فارغة)
		const closedMonths = await stationsClosedMonthModel.findAll({
			attributes: ["station_id", "month", "isClosed"],
			raw: true,
		});

		// 3) Index: station_id -> month -> isClosed
		const closedIndex = new Map();
		for (const row of closedMonths) {
			const sid = row.station_id;
			const m = Number(row.month);

			if (!closedIndex.has(sid)) closedIndex.set(sid, new Map());
			closedIndex.get(sid).set(m, row.isClosed);
		}

		// 4) نفس المخرجات المطلوبة تمامًا + 12 شهر لكل محطة
		const groupedByStation = stations.map((s) => {
			const monthsMap = closedIndex.get(s.id);

			const months = Array.from({ length: 12 }, (_, i) => {
				const month = i + 1;
				const isClosed =
					monthsMap && monthsMap.has(month) ? monthsMap.get(month) : false;

				return { month, isClosed };
			});

			return {
				station_id: s.id,
				station_name: s.name,
				station_number: s.number,
				months,
			};
		});

		return res.status(200).json({
			state: "success",
			closedMonths: groupedByStation,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});

exports.changeState = catchAsync(async (req, res, next) => {
	const { station_id, month, isClosed } = req.body;
	try {
		const stationsClosedMonthModel = getModel(
			req.year,
			"stations_closed_month",
		);

		const [record, created] = await stationsClosedMonthModel.findOrCreate({
			where: { station_id, month },
			defaults: { isClosed },
		});

		// Update only if not created and value is different
		if (!created && record.isClosed !== isClosed) {
			record.isClosed = isClosed;
			await record.save();
		}

		res.status(200).json({
			status: "success",
			message: "تم تحديث حالة الإغلاق للمحطات المحددة",
		});
	} catch (error) {
		return next(new AppError(error.message || error, 500));
	}
});
