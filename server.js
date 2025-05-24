const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./app");
const port = process.env.PORT;

app.listen(port, () => {
	console.log(`🚀 Server started successfully on port ${port}!!`);
});

const { Worker } = require("bullmq");
const { sendMessage, initializeVenom } = require("./whatsapp");

// (async () => {
// 	try {
// 		await initializeVenom(); // تهيئة venom قبل بدء العمل

// 		const worker = new Worker(
// 			"notification",
// 			async (job) => {
// 				const { recipient, message } = job.data;
// 				const formattedNumber = `${recipient}@c.us`;
// 				console.log(`📩 Received job:`, job.data);
// 				try {
// 					await sendMessage(formattedNumber, message);
// 					console.log(`✅ Message sent to ${recipient} (Job ${job.id})`);
// 				} catch (err) {
// 					console.error(`❌ Failed to send message (Job ${job.id}):`, err);
// 					throw err; // BullMQ سيعيد المحاولة تلقائيًا
// 				}
// 			},
// 			{
// 				connection: {
// 					host: "127.0.0.1",
// 					port: 6379,
// 				},
// 				backoff: {
// 					type: "exponential",
// 					delay: 5000,
// 				},
// 			}
// 		);

// 		worker.on("completed", (job) => {
// 			console.log(`✅ Job ${job.id} completed`);
// 		});

// 		worker.on("failed", (job, err) => {
// 			console.error(`❌ Job ${job.id} failed:`, err);
// 		});
// 	} catch (err) {
// 		console.error("❌ Error initializing venom or worker:", err);
// 	}
// })();
