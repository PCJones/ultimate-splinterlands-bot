function writeToLog(...logMessage) {
	const time = new Date().toLocaleString();
	const message = `[${time}] ${process.env.ACCUSERNAME}: ${logMessage}`;
	console.log(message);
}

function writeErrorToLog(...logMessage) {
	const time = new Date().toLocaleString();
	const message = `[${time}] ${process.env.ACCUSERNAME}: ${logMessage}`;
	console.error(message);
}

function writeToLogNoUsername(...logMessage) {
	const time = new Date().toLocaleString();
	const message = `[${time}] ${logMessage}` ;
	console.log(message);
}


exports.writeToLog = writeToLog;
exports.writeToLogNoUsername = writeToLogNoUsername;
exports.writeErrorToLog = writeErrorToLog;