const { promisify } = require("util");
// const db = require("./../connection");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const UserModel = require("./../models/userModel");
const PermissionModel = require("./../models/permissionModel");
const UserStationModel = require("../models/userStationModel");
const StationModel = require("../models/stationModel");
const UserDeviceModel = require("../models/userDeviceModel");
const AppVersion = process.env.APP_VERSION;
exports.login = catchAsync(async (req, res, next) => {
	try {
		const user = await UserModel.findOne({
			where: {
				username: req.body.username,
			},
		});
		// if (req.headers.appversion !== AppVersion) {
		// 	return next(
		// 		new AppError(
		// 			`اصدار السيرفر ${AppVersion}\n اصدار البرنامج ${req.headers.appversion}`,

		// 			401
		// 		)
		// 	);
		// }
		if (!user) {
			return next(new AppError("المستخدم غير موجود", 404));
		}
		//check device
		// const authDevices = await UserDeviceModel.findAll({
		// 	where: {
		// 		device_id: req.body.deviceId,
		// 	},
		// });
		// if (
		// 	authDevices.filter((el) => el.user_id === user.id).length === 0 &&
		// 	user.id !== 1
		// ) {
		// 	return next(
		// 		new AppError(
		// 			"لا تمتلك صلاحية الدخول من هذا الجهاز،يرجى التواصل مع تقنية المعلومات.",
		// 			401
		// 		)
		// 	);
		// }
		const checkPassword = bcrypt.compareSync(req.body.password, user.password);
		if (!checkPassword) {
			return next(new AppError("خطأ في كلمة المرور", 401));
		}

		const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

		// Omitting password field from the user object
		const { password, ...others } = user.toJSON();

		// Fetch permissions for the user
		const permissions = await PermissionModel.findAll({
			where: {
				user_id: user.id,
			},
		});
		const stations = await UserStationModel.findAll({
			where: {
				user_id: user.id,
			},
		});

		const permissionsObject = {};
		permissions.forEach((permission) => {
			permissionsObject[permission.permission] = true;
		});

		res.status(200).json({
			token,
			status: "good",
			user: others,
			permissions: permissionsObject,
			stations,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});

exports.protect = catchAsync(async (req, res, next) => {
	let token;
	// if (req.headers.appversion !== AppVersion) {
	// 	return next(new AppError("يوجد اصدار احدث للبرنامج", 401));
	// }

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
	}

	if (!token) {
		return next(new AppError("يرجى تسجيل الدخول مرة اخرى", 401));
	}

	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

	// Find the user based on the decoded user id
	const user = await UserModel.findByPk(decoded.id);

	if (!user) {
		return next(
			new AppError("المستخدم غير موجود، يرجى تسجيل الدخول مرة أخرى", 401)
		);
	}

	// Omitting password field from the user object
	const { password, ...others } = user.toJSON();
	req.user = others;
	next();
});
exports.restrictTo = (permission) => {
	return catchAsync(async (req, res, next) => {
		// Find permissions for the user
		const permissions = await PermissionModel.findAll({
			where: {
				user_id: req.user.id,
			},
		});
		const stations = await UserStationModel.findAll({
			where: {
				user_id: req.user.id,
			},
		});
		req.stations = stations;
		const userPermissions = permissions.map((el) => el.permission);
		if (!userPermissions.includes(permission)) {
			return next(
				new AppError(
					"عذراً، ليس لديك الصلاحية لتنفيذ هذه العملية. الرجاء التواصل مع مدير النظام",
					403
				)
			);
		}

		next();
	});
};
exports.restrictToStations = async (req, res, next) => {
	try {
		let stationsArr = [];
		if (req.user.id === 1) {
			stations = await StationModel.findAll({});
			stationsArr = stations.map((el) => el.id);
		} else {
			stations = await UserStationModel.findAll({
				where: {
					user_id: req.user.id,
				},
			});
			stationsArr = stations.map((el) => el.station_id);
		}
		req.stations = stationsArr;
		next();
	} catch (error) {
		return next(error);
	}
};
