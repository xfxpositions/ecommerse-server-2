import mongoose from "mongoose";
import { ConnectOptions } from "mongoose";
import logger from "../logger";

if (!process.env?.DB_URI) {
  logger.error("mongodb database uri is necessery");
  process.exit(1);
}

const uri = process.env.DB_URI;

function connect() {
  const db = mongoose
    .connect(uri)
    .then((db) => db)
    .catch((e) => {
      logger.error("some error happened while connecting to db" + e);
    });
  logger.info("connected to db");
  return db;
}

export default connect;
