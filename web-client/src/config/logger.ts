/*
	Purpose: Logger class for logging messages to the console.
	Usage:
		const logger = require('./logger');
		logger.info('This is an info message');
		logger.debug('This is a debug message');
		logger.warn('This is a warning message');
		logger.error('This is an error message');
	created because pino and winston were giving issues with nextjs version
*/

class Logger {
	level: string;

	constructor() {
		this.level = process.env.LOG_LEVEL || 'info';
	}

	private formatMessage(level: string, message: any) {
		const timestamp = new Date().toISOString();
		return `${timestamp} [${level.toUpperCase()}] ${message}`;
	}

	info(message: any) {
		if (this.level === 'info' || this.level === 'debug') {
			console.log(this.formatMessage('info', message));
		}
	}

	debug(message: any) {
		if (this.level === 'debug') {
			console.log(this.formatMessage('debug', message));
		}
	}

	warn(message: any) {
		if ([ 'warn', 'info', 'debug' ].includes(this.level)) {
			console.warn(this.formatMessage('warn', message));
		}
	}

	error(message: any) {
		console.error(this.formatMessage('error', message));
	}
}

const logger = new Logger();
export default logger
