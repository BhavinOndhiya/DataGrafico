const { createLogger, transports, format } = require("winston");
const { combine, timestamp, label, printf } = format;
const DailyRotateFile = require('winston-daily-rotate-file');

const CATEGORY = process.env.CATEGORY;

const logFormat = printf(({ level, message, label, timestamp }) => {
  return JSON.stringify({
    level,
    label,
    timestamp,
    message
  });
});

const logger = createLogger({
  level: "info",
  format: combine(
    label({ label: CATEGORY }),
    timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
    logFormat
  ),
  transports: [
    new DailyRotateFile({
      filename: 'logs/%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      prepend: true,
      json: false
    }),
    new transports.Console()
  ]
});

module.exports = logger;
