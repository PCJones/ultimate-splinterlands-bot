const chalk = require('chalk');

function writeToLog(...logMessage) {
	const time = new Date().toLocaleString();
	const message = `[${time}] ${process.env.ACCUSERNAME}: ${logMessage}`;
	console.log(message);
	return message;
}

function writeErrorToLog(...logMessage) {
	const time = new Date().toLocaleString();
	const message = `[${time}] ${process.env.ACCUSERNAME}: ${objToString(logMessage)}`;
	console.error(message);
}

function writeToLogNoUsername(...logMessage) {
	const time = new Date().toLocaleString();
	const message = `[${time}] ${logMessage}` ;
	console.log(message);
}

function objToString (obj) {
    return Object.entries(obj).reduce((str, [p, val]) => {
        return `${str}${p}::${val}\n`;
    }, '');
}

exports.writeToLog = writeToLog;
exports.writeToLogNoUsername = writeToLogNoUsername;
exports.writeErrorToLog = writeErrorToLog;
