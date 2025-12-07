const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { Op } = require("sequelize");
const notificationQueue = require("../queues/notificationQueue");
const { getModel } = require("../utils/modelSelect");

const path = require("path");

exports.sendNotification = catchAsync(async (req, res, next) => {
	const UserModel = getModel(req.headers["x-year"], "user");
	const recipients = JSON.parse(req.body.recipients);

	const users = await UserModel.findAll({
		where: { id: { [Op.in]: recipients } },
		attributes: ["phone"],
		raw: true,
	});

	const isPdf =
		req.file && path.extname(req.file.originalname).toLowerCase() === ".pdf";
	try {
		for (const user of users) {
			for (let i = 0; i < users.length; i++) {
				await notificationQueue.add("send-whatsapp", {
					recipient: users[i].phone,
					message: req.body.msg,
					image: isPdf ? undefined : req.file?.path,
					pdf: isPdf ? req.file?.path : undefined,
					filename: req.file?.originalname,
					deleteAfterSend: i === users.length - 1, // only last job gets the flag
				});
			}
		}
		res.status(200).json({ state: "success" });
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
