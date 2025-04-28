const venom = require("venom-bot");
const path = require("path");
let client = null;
let initialized = false;

async function initializeVenom() {
	if (initialized && client) return client;
	// const browserPath = "/usr/bin/chromium";
	const browserPath =
		"D:/projects/stations/api/chrome-headless-shell/win64-135.0.7049.84/chrome-headless-shell-win64/chrome-headless-shell.exe";
	client = await venom.create({
		session: "my-session",
		multidevice: true,
		browserPathExecutable: browserPath,
		puppeteerOptions: {
			headless: true,
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
		},
	});
	initialized = true;

	return client;
}

async function sendMessage(to, message) {
	if (!client) {
		throw new Error("WhatsApp client is not initialized");
	}

	return client.sendText(to, message);
}

module.exports = {
	initializeVenom,
	sendMessage,
};
