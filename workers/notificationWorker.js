const { Worker } = require("bullmq");
const {
	sendMessage,
	sendImage,
	sendFile,
	initializeBaileys,
} = require("../whatsapp");
const { Buffer } = require("buffer");
const path = require("path");

(async () => {
	await initializeBaileys(); // تأكد من التهيئة أولاً

	const worker = new Worker(
		"notification",
		async (job) => {
			console.log(`job`, job);
			const { recipient, message, imageBuffer, filename } = job.data;
			const formattedNumber = `${recipient}@s.whatsapp.net`;

			try {
				if (imageBuffer) {
					console.log(`sending image/file`);
					// Infer mime type from filename extension
					const ext = filename ? path.extname(filename).slice(1) : "jpeg"; // default jpeg
					const mimeTypes = {
						jpg: "image/jpeg",
						jpeg: "image/jpeg",
						png: "image/png",
						webp: "image/webp",
						gif: "image/gif",
						pdf: "application/pdf", // pdf support if sendFile used
					};
					const mimeType = mimeTypes[ext.toLowerCase()] || "image/jpeg";

					// Prepare buffer from imageBuffer input
					let bufferToSend;
					if (Buffer.isBuffer(imageBuffer)) {
						bufferToSend = imageBuffer;
					} else if (imageBuffer.data) {
						bufferToSend = Buffer.from(imageBuffer.data);
					} else {
						throw new Error("Unknown imageBuffer format");
					}

					// Send file or image based on mime type
					if (mimeType === "application/pdf") {
						if (typeof sendFile === "function") {
							await sendFile(
								formattedNumber,
								bufferToSend,
								filename || "",
								message || ""
							);
						} else {
							throw new Error("sendFile method not implemented for PDFs");
						}
					} else {
						await sendImage(
							formattedNumber,
							bufferToSend,
							filename || "",
							message || ""
						);
					}
				} else {
					console.log(`sending text message`);
					await sendMessage(formattedNumber, message);
				}

				console.log(`✅ Job ${job.id} completed: Message sent to ${recipient}`);
			} catch (err) {
				console.error(`❌ Failed to send message:`, err);
				throw err; // Will retry according to backoff settings
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
		}
	);

	worker.on("completed", (job) => {
		console.log(`✅ Job ${job.id} completed`);
	});

	worker.on("failed", (job, err) => {
		console.error(`❌ Job ${job.id} failed:`, err);
	});
})();
