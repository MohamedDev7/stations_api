const { Queue } = require("bullmq");

(async () => {
	const queue = new Queue("notification", {
		connection: { host: "127.0.0.1", port: 6379 },
	});

	// 1) Remove waiting + delayed jobs
	await queue.drain(true); // true => also delayed

	// 2) Remove completed + failed history
	await queue.clean(0, 1000, "completed"); // all completed
	await queue.clean(0, 1000, "failed"); // all failed

	// 3) (Optional) Hard‑reset everything, including repeatable/meta, if your version supports it
	// await queue.obliterate({ force: true });

	await queue.close();
	console.log("Queue cleared.");
})();
