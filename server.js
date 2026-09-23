const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./app");
const port = process.env.PORT;
const fs = require("fs");

app.listen(port, () => {
	console.log(`🚀 Server started successfully on port ${port}!!`);
});

const { Worker } = require("bullmq");
const {
	sendMessage,
	initializeBaileys,
	sendImage,
	sendFile,
} = require("./whatsapp");

(async () => {
	try {
		// await initializeBaileys(); // تهيئة Baileys قبل بدء العمل

		console.log("✅ WhatsApp initialized, starting worker...");

		const worker = new Worker(
			"stations-notification",
			async (job) => {
				console.log(`📨 Processing job ${job.id}:`, job.data);
				const { recipient, message, image, pdf, deleteAfterSend } = job.data;
				const fileToDelete = image || pdf; // whichever field has the file path
				const formattedNumber = `${recipient}@s.whatsapp.net`;

				try {
					if (image) {
						console.log(`Sending image to ${formattedNumber}`);
						await sendImage(formattedNumber, image, "", message);
					} else if (pdf) {
						console.log(`Sending PDF to ${formattedNumber}`);
						await sendFile(formattedNumber, pdf, "", message);
					} else {
						console.log(`Sending text to ${formattedNumber}`);
						await sendMessage(formattedNumber, message);
					}
					console.log(`✅ Message sent successfully to ${recipient}`);
					if (deleteAfterSend && fileToDelete) {
						fs.unlink(fileToDelete, (err) => {
							if (err) {
								console.error("Failed to delete file:", fileToDelete, err);
							} else {
								console.log("Deleted file after all sends:", fileToDelete);
							}
						});
					}
				} catch (err) {
					console.error(`❌ Error sending message:`, err);
					throw err; // BullMQ سيعيد المحاولة تلقائيًا
				}
			},
			{
				connection: {
					host: "127.0.0.1",
					port: 6379,
				},
				backoff: {
					type: "exponential",
					delay: 5000,
				},
			},
		);
		worker.on("failed", (job, err) => {
			console.error(`❌ Job ${job.id} failed:`, err);
		});
	} catch (err) {
		console.error("❌ Error initializing venom or worker:", err);
	}
})();
