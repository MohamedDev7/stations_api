const crypto = require("crypto");
if (!global.crypto) {
	global.crypto = {
		getRandomValues: (arr) => crypto.randomBytes(arr.length),
		subtle: crypto.webcrypto.subtle,
	};
}
const path = require("path");
const fs = require("fs");
const qrcode = require("qrcode-terminal");

let sock = null;
let initialized = false;
let baileysModule = null;
let initPromise = null;
let connectionResolve = null;

// Load baileys module dynamically (ES Module)
async function loadBaileys() {
	if (!baileysModule) {
		baileysModule = await import("baileys");
	}
	return baileysModule;
}

async function createSocket() {
	const baileys = await loadBaileys();
	const {
		default: makeWASocket,
		useMultiFileAuthState,
		fetchLatestBaileysVersion,
		DisconnectReason,
	} = baileys;

	const authFolder = path.join(__dirname, "baileys_auth");
	const { state, saveCreds } = await useMultiFileAuthState(authFolder);
	const { version } = await fetchLatestBaileysVersion();

	sock = makeWASocket({
		version,
		auth: state,
	});

	sock.ev.on("creds.update", saveCreds);

	sock.ev.on("connection.update", async (update) => {
		const { connection, lastDisconnect, qr } = update;

		// Handle QR code manually (printQRInTerminal is deprecated)
		if (qr) {
			console.log("QR Code received. Scan with WhatsApp:");
			qrcode.generate(qr, { small: true });
		}

		if (connection === "close") {
			const statusCode = lastDisconnect?.error?.output?.statusCode;
			const isLoggedOut = statusCode === DisconnectReason.loggedOut;

			console.log("Connection closed:", {
				statusCode,
				isLoggedOut,
			});

			// Auto-reconnect unless logged out
			if (!isLoggedOut) {
				console.log("Reconnecting to WhatsApp...");
				initialized = false;
				sock = null;
				setTimeout(() => {
					createSocket();
				}, 3000);
			}
		} else if (connection === "open") {
			console.log("Connected to WhatsApp");
			initialized = true;
			// Resolve the pending promise
			if (connectionResolve) {
				connectionResolve(sock);
				connectionResolve = null;
			}
		}
	});
}

async function initializeBaileys() {
	// If already initialized, return the socket
	if (initialized && sock) return sock;

	// If already initializing, return the existing promise
	if (initPromise) return initPromise;

	// Create a new promise for the initialization
	initPromise = new Promise(async (resolve) => {
		connectionResolve = resolve;
		await createSocket();
	});

	return initPromise;
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
