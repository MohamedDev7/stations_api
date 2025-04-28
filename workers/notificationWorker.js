// workers/notificationWorker.js
const { Worker } = require("bullmq");
const { sendMessage, initializeVenom } = require("../whatsapp");

(async () => {
	await initializeVenom(); // تأكد من التهيئة أولاً

	const worker = new Worker(
		"notification",
		async (job) => {
			const { recipient, message } = job.data;
			const formattedNumber = `${recipient}@c.us`;
			console.log(`📩 Received job:`, job.data);

			try {
				// إرسال الرسالة عبر WhatsApp
				await sendMessage(formattedNumber, message);
				console.log(`✅ Job ${job.id} completed: Message sent to ${recipient}`);
			} catch (err) {
				console.error(`❌ Failed to send message:`, err);
				throw err; // سيتم إعادة المحاولة تلقائيًا حسب إعدادات `backoff`
			}
		},
		{
			connection: {
				host: "127.0.0.1",
				port: 6379,
			},
			backoff: {
				type: "exponential",
				delay: 5000, // تأخير 5 ثواني بين المحاولات
			},
		}
	);

	worker.on("completed", (job) => {
		console.log(`✅ Job ${job.id} completed`);
	});

	worker.on("failed", (job, err) => {
		console.error(`❌ Job ${job.id} failed:`, err);
	});
})();
