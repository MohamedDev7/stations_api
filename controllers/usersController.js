const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const bcrypt = require("bcryptjs");
const UserModel = require("./../models/userModel");
const PermissionModel = require("./../models/permissionModel");
const { Op } = require("sequelize");
const sequelize = require("./../connection");
const UserStationModel = require("../models/userStationModel");
const notificationQueue = require("../queues/notificationQueue");
const crypto = require("crypto");

exports.getAllUsers = catchAsync(async (req, res, next) => {
	try {
		// Fetch users from the database
		const users = await UserModel.findAll({
			attributes: ["id", "username", "first_name", "last_name", "phone"],
			where: {
				username: {
					[Op.ne]: "admin", // Exclude the 'admin' user from the results
				},
			},
		});

		res.status(200).json({
			status: "success",
			users: users,
		});
	} catch (error) {
		// Handle any errors that occur during the user fetching process
		return next(new AppError(error, 500));
	}
});
exports.getUser = catchAsync(async (req, res, next) => {
	try {
		const userId = req.params.id;

		// Fetch user details from the UserModel
		const user = await UserModel.findOne({
			where: { id: userId },
			attributes: ["id", "username", "first_name", "last_name", "phone"],
		});

		if (!user) {
			return next(new AppError("User not found", 404));
		}

		// Fetch permissions for the user from the PermissionModel
		const permissions = await PermissionModel.findAll({
			where: { user_id: userId },
		});
		// Fetch permissions for the user from the PermissionModel
		const stations = await UserStationModel.findAll({
			where: { user_id: userId },
		});

		res.status(200).json({
			status: "success",
			user,
			permissions,
			stations,
		});
	} catch (error) {
		// Handle any errors that occur during the user fetching process
		return next(new AppError(error, 500));
	}
});
exports.getUsername = catchAsync(async (req, res, next) => {
	try {
		const userId = req.params.id;

		// Fetch the username of the user from the UserModel
		const user = await UserModel.findOne({
			where: { id: userId },
			attributes: ["username"],
		});

		if (!user) {
			return next(new AppError("المستخدم غير موجود", 404));
		}

		res.status(200).json({
			status: "success",
			username: user.username,
		});
	} catch (error) {
		// Handle any errors that occur during the username fetching process
		return next(new AppError(error, 500));
	}
});
exports.addUser = catchAsync(async (req, res, next) => {
	try {
		// Check if the username already exists
		const existingUser = await UserModel.findOne({
			where: { username: req.body.username },
		});
		if (existingUser) {
			return next(new AppError("المستخدم موجود من قبل", 500));
		}
		const randomPassword = crypto.randomBytes(4).toString("hex");
		const salt = bcrypt.genSaltSync(10);
		const hashedPassword = bcrypt.hashSync(randomPassword, salt);

		let newUser;
		let permissions = [];

		await sequelize.transaction(async (t) => {
			newUser = await UserModel.create(
				{
					username: req.body.username,
					password: hashedPassword,
					first_name: req.body.firstname,
					last_name: req.body.lastname,
					phone: req.body.phone,
				},
				{ transaction: t }
			);
			Object.entries(req.body.permissions).forEach(([permission, value]) => {
				if (value === true) {
					permissions.push({ user_id: newUser.id, permission: permission });
				}
			});
			const userStationsArr = req.body.stations.map((station) => {
				return { user_id: newUser.id, station_id: station.station_id };
			});

			await PermissionModel.bulkCreate(permissions, { transaction: t });
			await UserStationModel.bulkCreate(userStationsArr, { transaction: t });
		});

		const message = `مرحباً ${newUser.first_name}، تم إنشاء حسابك بنجاح.\nاسم المستخدم: ${newUser.username}\nكلمة المرور: ${randomPassword}\n الرجاء تسجيل الدخول وتغيير كلمة المرور.`;
		const recipient = newUser.phone;

		await notificationQueue.add("send-whatsapp", {
			recipient,
			message,
		});
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.deleteUser = catchAsync(async (req, res, next) => {
	try {
		if (req.params.id === "1") {
			return next(new AppError("لايمكن حذف هذا المستخدم", 500));
		}

		// Find the user by ID and delete it
		const user = await UserModel.findByPk(req.params.id);
		if (!user) {
			return next(new AppError("User not found", 404));
		}

		await user.destroy();

		res.status(200).json({ state: "success" });
	} catch (error) {
		// Handle any errors that occur during the user deletion process
		return next(new AppError("حصل خطا أثناء حذف المستخدم", 500));
	}
});

exports.updateUser = catchAsync(async (req, res, next) => {
	try {
		await sequelize.transaction(async (t) => {
			await UserModel.update(
				{
					username: req.body.username,
					// password: hashedPassword,
					first_name: req.body.firstname,
					last_name: req.body.lastname,
					phone: req.body.phone,
				},
				{ where: { id: req.params.id }, transaction: t }
			); // Get existing permissions for the user
			const existingPermissions = await PermissionModel.findAll({
				where: { user_id: req.params.id },
			});

			const existingPermissionsSet = new Set(
				existingPermissions.map((row) => row.permission)
			);

			// Update permissions based on the request body
			const permissionsToUpdate = [];
			const permissionsToDelete = [];

			for (const [permission, value] of Object.entries(req.body.permissions)) {
				if (value === true && !existingPermissionsSet.has(permission)) {
					permissionsToUpdate.push({
						user_id: req.params.id,
						permission: permission,
					});
				} else if (value === false && existingPermissionsSet.has(permission)) {
					permissionsToDelete.push(permission);
				}
			} // Update permissions within the same transaction
			await Promise.all([
				PermissionModel.bulkCreate(permissionsToUpdate, { transaction: t }),
				PermissionModel.destroy({
					where: { user_id: req.params.id, permission: permissionsToDelete },
					transaction: t,
				}),
			]);
			// Update user_stations based on the request body
			const stationsToUpdate = req.body.stations.map((station) => {
				return {
					user_id: req.params.id,
					station_id: station.station_id,
				};
			});

			// Get existing user_stations for the user
			const existingStations = await UserStationModel.findAll({
				where: { user_id: req.params.id },
			});
			const existingStationSet = new Set(
				existingStations.map((row) => row.station_id)
			);

			// Identify stations to add and delete
			const stationsToAdd = stationsToUpdate.filter(
				(station) => !existingStationSet.has(station.station_id)
			);
			const stationsToDelete = existingStations.filter(
				(station) =>
					!stationsToUpdate.some((s) => s.station_id === station.station_id)
			);

			// Update user_stations within the same transaction
			await Promise.all([
				UserStationModel.bulkCreate(stationsToAdd, { transaction: t }),
				UserStationModel.destroy({
					where: {
						user_id: req.params.id,
						station_id: stationsToDelete.map((s) => s.station_id),
					},
					transaction: t,
				}),
			]);
		});
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError("حصل خطا اثناء تحديث بيانات المستخدم", 500));
	}
});
exports.changePassword = catchAsync(async (req, res, next) => {
	try {
		const userId = req.user.id;
		const { old, password } = req.body;

		const user = await UserModel.findByPk(userId);
		if (!user) {
			return next(new AppError("المستخدم غير موجود", 404));
		}
		const isMatch = bcrypt.compareSync(old, user.password);
		if (!isMatch) {
			return next(new AppError("كلمة المرور القديمة غير صحيحة", 401));
		}
		const salt = bcrypt.genSaltSync(10);
		const hashedNewPassword = bcrypt.hashSync(password, salt);
		await UserModel.update(
			{ password: hashedNewPassword },
			{ where: { id: userId } }
		);
		if (user.phone) {
			await notificationQueue.add("send-whatsapp", {
				recipient: user.phone,
				message: "تم تغيير كلمة المرور بنجاح ✅",
			});
		}
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError("حصل خطا اثناء تحديث كلمة المرور ", 500));
	}
});
exports.changePasswordByAdmin = catchAsync(async (req, res, next) => {
	try {
		const userId = req.params.id;
		const randomPassword = crypto.randomBytes(4).toString("hex");
		const salt = bcrypt.genSaltSync(10);
		const hashedPassword = bcrypt.hashSync(randomPassword, salt);
		await UserModel.update(
			{ password: hashedPassword },
			{ where: { id: userId } }
		);
		const user = await UserModel.findByPk(userId);
		if (user.phone) {
			const message = `مرحباً ${user.first_name}، تم تغيير كلمة المرور لحسابك بنجاح.\nكلمة المرور الجديدة: ${randomPassword}\n الرجاء تسجيل الدخول وتغيير كلمة المرور.`;
			const recipient = user.phone;

			await notificationQueue.add("send-whatsapp", {
				recipient,
				message,
			});
		}
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError("حصل خطا اثناء تحديث كلمة المرور ", 500));
	}
});
