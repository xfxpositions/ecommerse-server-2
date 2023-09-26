import { Random } from "random-js";
import User from "../models/user";
import logger from "../logger";
import IUser from "../types/user";

const random = new Random(); // uses the nativeMath engine

async function genRandomUserId(): Promise<number | Error> {
  for (let i = 0; i < 100000; i++) {
    const value = random.integer(1, 100000);
    const user = await User.findOne({ userId: value });
    // return the random generated number if there's no user
    if (user == null) {
      return value;
    }
  }
  throw Error("User limit excuded, please check out utils/genRandomUserId");
}

export default genRandomUserId;
