import mongoose from "mongoose";
import logger from "../logger";

if (!process.env?.DB_URI) {
  logger.error("mongodb database uri is necessery");
  process.exit(1);
}

const uri = process.env.DB_URI;

function connect() {
  logger.info("trying to connect db");
  const db = mongoose
    .connect(uri)
    .then((db) => {
      logger.info("connected to db");
      return db;
    })
    .catch((e) => {
      logger.error("some error happened while connecting to db" + e);
      process.exit(1);
    });
  return db;
}

export default connect;
