// queues/notificationQueue.js
const { Queue } = require("bullmq");

const notificationQueue = new Queue("stations-notification", {
	connection: {
		host: process.env.REDIS_HOST || "127.0.0.1",
		port: process.env.REDIS_PORT || 6379,
		maxRetriesPerRequest: null, // ✅ ضروري أيضًا هنا
	},
});

module.exports = notificationQueue;
