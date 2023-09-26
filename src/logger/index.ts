import winston from "winston";
import path from "path";
import { format } from "winston";
import moment from "moment-timezone";

const logsFolder = path.join(import.meta.dir, "..", "..", "logs", "dev");

const logger = winston.createLogger({
  level: "info",
  format: format.combine(
    format.colorize(), // optional
    format.timestamp({
      format: () => moment().tz("Etc/GMT-3").format("DD-MM-YYYY HH:mm:ss.SSS"), // Zaman damgasını özelleştiriyoruz
    }),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(logsFolder, "info.log"),
      level: "info",
      format: format.uncolorize(),
    }),
    new winston.transports.File({
      filename: path.join(logsFolder, "error.log"),
      level: "error",
      format: format.uncolorize(),
    }),
    new winston.transports.File({
      filename: path.join(logsFolder, "warn.log"),
      level: "warn",
      format: format.uncolorize(),
    }),
    new winston.transports.File({
      filename: path.join(logsFolder, "http.log"),
      level: "http",
      format: format.uncolorize(),
    }),
    new winston.transports.File({
      filename: path.join(logsFolder, "debug.log"),
      level: "debug",
      format: format.uncolorize(),
    }),
    new winston.transports.File({
      filename: path.join(logsFolder, "verbose.log"),
      level: "verbose",
      format: format.uncolorize(),
    }),
    new winston.transports.File({
      filename: path.join(logsFolder, "silly.log"),
      level: "silly",
      format: format.uncolorize(),
    }),
    new winston.transports.File({
      filename: path.join(logsFolder, "combined.log"),
    }),
  ],
});

logger.info(`logging into ${logsFolder}`);

export default logger;
