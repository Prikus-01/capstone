const pino = require('pino');
const pinoHttp = require('pino-http');

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
});

const httpLogger = pinoHttp({ logger });

module.exports = { logger, httpLogger };
