const crypto = require("crypto");
if (!global.crypto) {
	global.crypto = {
		getRandomValues: (arr) => crypto.randomBytes(arr.length),
		subtle: crypto.webcrypto.subtle,
	};
}
const {
	default: makeWASocket,
	useMultiFileAuthState,
	fetchLatestBaileysVersion,
	DisconnectReason,
} = require("@whiskeysockets/baileys");
const path = require("path");
const fs = require("fs");

let sock = null;
let initialized = false;

async function initializeBaileys() {
	if (initialized && sock) return sock;

	const authFolder = path.join(__dirname, "baileys_auth");
	const { state, saveCreds } = await useMultiFileAuthState(authFolder);
	const { version } = await fetchLatestBaileysVersion();

	sock = makeWASocket({
		version,
		auth: state,
		printQRInTerminal: true,
	});

	sock.ev.on("creds.update", saveCreds);

	sock.ev.on("connection.update", (update) => {
		const { connection, lastDisconnect } = update;
		if (connection === "close") {
			const shouldReconnect =
				lastDisconnect?.error?.output?.statusCode !==
				DisconnectReason.loggedOut;
			console.log(`Connection closed, should reconnect: ${shouldReconnect}`);
			if (shouldReconnect) {
				initialized = false; // Allow re-initialization
				initializeBaileys().catch(console.error);
			}
		} else if (connection === "open") {
			console.log("Connected to WhatsApp");
		}
	});

	initialized = true;
	return sock;
}

/**
 * Send a text message
 * @param {string} to - recipient in {number}@s.whatsapp.net format
 * @param {string} message - text message to send
 */
async function sendMessage(to, message) {
	if (!sock) throw new Error("WhatsApp client is not initialized");
	return sock.sendMessage(to, { text: message });
}

/**
 * Send an image (supports file path or buffer)
 * @param {string} to - recipient in {number}@s.whatsapp.net format
 * @param {string|Buffer} image - image file path or buffer
 * @param {string} filename - optional filename for the image
 * @param {string} caption - optional caption text
 */
async function sendImage(to, image, filename = "", caption = "") {
	if (!sock) throw new Error("WhatsApp client is not initialized");

	let buffer;
	if (Buffer.isBuffer(image)) {
		buffer = image;
	} else if (typeof image === "string") {
		buffer = fs.readFileSync(image);
	} else {
		throw new Error("sendImage expects a file path or Buffer");
	}

	return sock.sendMessage(to, { image: buffer, caption });
}

/**
 * Send a file (supports file path or buffer)
 * @param {string} to - recipient in {number}@s.whatsapp.net format
 * @param {string|Buffer} file - file path or buffer
 * @param {string} filename - file name to show in WhatsApp
 * @param {string} caption - optional caption text
 */
async function sendFile(to, file, filename = "", caption = "") {
	if (!sock) throw new Error("WhatsApp client is not initialized");

	let buffer;
	if (Buffer.isBuffer(file)) {
		buffer = file;
	} else if (typeof file === "string") {
		buffer = fs.readFileSync(file);
	} else {
		throw new Error("sendFile expects a file path or Buffer");
	}

	// Use generic mimetype; better if you dynamically detect or specify
	return sock.sendMessage(to, {
		document: buffer,
		mimetype: "application/pdf",
		fileName: filename,
		caption,
	});
}

module.exports = { initializeBaileys, sendMessage, sendImage, sendFile };
