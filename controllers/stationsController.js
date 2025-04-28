const catchAsync = require("../utils/catchAsync");
const StationModel = require("./../models/stationModel");
const TankModel = require("./../models/tankModel");
const sequelize = require("./../connection");
const DispenserModel = require("./../models/dispenserModel");
const DispenserMovmentModel = require("./../models/dispenserMovmentModel");
const AppError = require("../utils/appError");
const StoreModel = require("../models/storeModel");
const StoreMovmentModel = require("../models/storeMovmentModel");
const TankMovmentModel = require("../models/tankMovmentModel");
const substanceModel = require("../models/substanceModel");
const MovmentModel = require("../models/movmentModel");
const ShiftModel = require("../models/shiftModel");
const { Sequelize } = require("sequelize");
const IncomeModel = require("../models/incomeModel");
const DispenserWheelCounterMovmentModel = require("../models/dispenserWheelCounterMovmentModel");
const SubstanceModel = require("../models/substanceModel");
const SubstancePriceMovmentModel = require("../models/substancePriceMovmentModel");
const { Op } = require("sequelize");
const MovmentsShiftsModel = require("../models/movmentsShiftsModel");
const { raw } = require("mysql2");
exports.getAllStations = catchAsync(async (req, res, next) => {
	try {
		const stations = await StationModel.findAll({
			where: {
				id: {
					[Sequelize.Op.in]: req.stations,
				},
			},
		});
		res.status(200).json({
			state: "success",
			stations,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getStation = catchAsync(async (req, res, next) => {
	try {
		const substance = await StationModel.findByPk(req.params.id);
		res.status(200).json({
			state: "success",
			substance,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.addStation = catchAsync(async (req, res, next) => {
	try {
		await sequelize.transaction(async (t) => {
			const substances = await SubstancePriceMovmentModel.findAll({
				where: {
					[Op.and]: [
						{ start_date: { [Op.lte]: req.body.date } }, // Start date is less than or equal to requestDate
						{ end_date: { [Op.gte]: req.body.date } }, // End date is greater than or equal to requestDate
					],
				},
				raw: true,
			});

			const station = await StationModel.create(
				{
					name: req.body.name,
					number: req.body.number,
					province: req.body.province,
					shifts: req.body.shifts.length,
					supervisor: req.body.supervisor,
				},
				{ transaction: t }
			);

			const shiftsArr = req.body.shifts.map((el) => {
				return {
					start: el.start,
					end: el.end,
					station_id: station.id,
					number: el.number,
				};
			});

			const shifts = await ShiftModel.bulkCreate(shiftsArr, { transaction: t });
			const highestShift = Math.max(...shifts.map((obj) => obj.number));
			const startDate = new Date(req.body.date);
			const previousDay = new Date(startDate);
			previousDay.setDate(startDate.getDate() - 1);
			const year = startDate.getFullYear().toString().slice(-2);

			const movment = await MovmentModel.create(
				{
					station_id: station.id,
					date: previousDay,
					number: `${station.number.toString().padStart(2, "0")}${year}0000`,
					state: "approved",
					shifts: req.body.shifts.length,
					has_stocktaking: 0,
				},
				{ transaction: t }
			);
			const movmentShift = await MovmentsShiftsModel.create(
				{
					movment_id: movment.id,
					station_id: station.id,
					number: highestShift,
					state: "saved",
					start: shifts.filter((shift) => shift.number === highestShift)[0]
						.start,
					end: shifts.filter((shift) => shift.number === highestShift)[0].end,
				},
				{ transaction: t, raw: true }
			);

			const tanksArr = req.body.tanks.map((el) => {
				return {
					number: el.number,
					substance_id: el.substance,
					dead_amount: el.deadAmount,
					capacity: el.capacity,
					station_id: station.id,
				};
			});

			const tanks = await TankModel.bulkCreate(tanksArr, { transaction: t });

			const tanksMovmentsArr = tanks.map((el) => {
				return {
					prev_value: 0,
					curr_value: 0,
					tank_id: el.id,
					movment_id: movment.id,
					station_id: station.id,
					price: substances.filter(
						(ele) => ele.substance_id === el.substance_id
					)[0].price,
					price_movment_id: substances.filter(
						(ele) => ele.substance_id === el.substance_id
					)[0].id,
				};
			});

			await TankMovmentModel.bulkCreate(tanksMovmentsArr, { transaction: t });

			const dispensersArr = req.body.dispensers.map((el) => {
				return {
					number: el.number,
					tank_id: tanks.filter((ele) => ele.number === el.tankNumber)[0].id,
					station_id: station.id,
					A: el.A,
					B: el.B,
					wheel_counter_A: el.wheelCounter_A,
					wheel_counter_B: el.wheelCounter_B,
				};
			});
			const dispensers = await DispenserModel.bulkCreate(dispensersArr, {
				transaction: t,
			});

			const dispensersMovmentsArr = dispensers.map((el) => {
				const substance_id = tanks.filter((ele) => ele.id === el.tank_id)[0]
					.substance_id;
				return {
					prev_A: +el.A,
					prev_B: +el.B,
					curr_A: +el.A,
					curr_B: +el.B,
					// start: shifts.filter((shift) => shift.number === highestShift)[0]
					// 	.start,
					// end: shifts.filter((shift) => shift.number === highestShift)[0].end,
					// shift_number: highestShift,
					tank_id: +el.tank_id,
					shift_id: movmentShift.id,
					movment_id: +movment.id,
					dispenser_id: +el.id,
					employee_id: 0,
					station_id: station.id,
					price: substances.filter(
						(ele) => ele.substance_id === substance_id
					)[0].price,
					price_movment_id: substances.filter(
						(ele) => ele.substance_id === substance_id
					)[0].id,
				};
			});

			await DispenserMovmentModel.bulkCreate(dispensersMovmentsArr, {
				transaction: t,
			});

			const dispensersWheelCounterMovmentsArr = dispensers.map((el) => {
				return {
					prev_A: +el.wheel_counter_A,
					prev_B: +el.wheel_counter_B,
					curr_A: +el.wheel_counter_A,
					curr_B: +el.wheel_counter_B,
					movment_id: +movment.id,
					dispenser_id: +el.id,
					station_id: station.id,
				};
			});

			await DispenserWheelCounterMovmentModel.bulkCreate(
				dispensersWheelCounterMovmentsArr,
				{
					transaction: t,
				}
			);

			const storesArr = req.body.stores.map((el) => {
				return {
					name: el.name,
					type: el.type,
					substance_id: el.substance_id,
					substance_name: el.substance_name,
					station_id: station.id,
				};
			});
			const stores = await StoreModel.bulkCreate(storesArr, {
				transaction: t,
			});

			const newStores = stores.map((el) => {
				const updatedStore = req.body.stores.find(
					(ele) => ele.name === el.name && el.substance_id === ele.substance_id
				);
				if (updatedStore) {
					return { ...updatedStore, id: el.id };
				} else {
					return el;
				}
			});

			const incomesArr = newStores.map((el) => {
				return {
					amount: +el.init_stock,
					substance_id: +el.substance_id,
					station_id: station.id,
					store_id: +el.id,
					// start: shifts.filter((shift) => shift.number === highestShift)[0]
					// 	.start,
					// end: shifts.filter((shift) => shift.number === highestShift)[0].end,
					// shift_number: highestShift,
					shift_id: movmentShift.id,
					doc_number: 0,
					doc_amount: +el.init_stock,
					from: "",
					type: "initial",
					movment_id: +movment.id,
					truck_number: 1,
					truck_driver: "رصيد افتتاحي",
					price: substances.filter(
						(ele) => ele.substance_id === el.substance_id
					)[0].price,
					price_movment_id: substances.filter(
						(ele) => ele.substance_id === el.substance_id
					)[0].id,
				};
			});

			await IncomeModel.bulkCreate(incomesArr, {
				transaction: t,
			});

			const storesMovmentsArr = [];
			stores.forEach((store) => {
				storesMovmentsArr.push({
					prev_value: 0,
					curr_value: newStores.filter((el) => el.id === store.id)[0]
						.init_stock,
					date: startDate,
					store_id: store.id,
					// start: shifts.filter((shift) => shift.number === highestShift)[0]
					// 	.start,
					// end: shifts.filter((shift) => shift.number === highestShift)[0].end,
					// shift_number: highestShift,
					movment_id: movment.id,
					station_id: station.id,
					shift_id: movmentShift.id,
					price: substances.filter(
						(ele) => ele.substance_id === store.substance_id
					)[0].price,
					price_movment_id: substances.filter(
						(ele) => ele.substance_id === store.substance_id
					)[0].id,
				});
			});
			await StoreMovmentModel.bulkCreate(storesMovmentsArr, { transaction: t });
		});

		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.deleteStation = catchAsync(async (req, res, next) => {
	try {
		await StationModel.destroy({
			where: { id: req.params.id },
		});
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});

exports.updateStation = catchAsync(async (req, res, next) => {
	try {
		await SubstanceModel.update(
			{ name: req.body.name, price: req.body.price },
			{
				where: { id: req.params.id },
			}
		);
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
