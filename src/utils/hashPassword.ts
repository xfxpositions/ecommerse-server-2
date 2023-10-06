import { randomBytes, randomUUID } from "crypto";
import IHashedPassword from "../types/hashedPassword";
import logger from "../logger";

async function hashPassword(password: string): Promise<IHashedPassword> {
  const saltKey = randomUUID();

  try {
    const hash = await Bun.password.hash(password + saltKey, "bcrypt");
    const HashedPassword: IHashedPassword = {
      hash: hash,
      saltKey: saltKey,
    };
    return HashedPassword;
  } catch (err) {
    console.log("some error happened while trying to hash password ", err);
    throw err;
  }
}

async function verifyHash(hash: string, password: string, saltKey: string) {
  try {
    const result = await Bun.password.verify(password, hash, "bcrypt");
    return result;
  } catch (err) {
    logger.error("some error happened while trying to hash password ", err);
    throw err;
  }
}

async function test() {
  try {
    const password = "testpassword123";
    const hashedPassword = await hashPassword(password);
    try {
      const verifyResult = await verifyHash(
        hashedPassword.hash,
        password,
        hashedPassword.saltKey
      );
      console.log(verifyResult);
    } catch (err) {
      logger.error("some error happened", err);
    }

    console.log(`password is: ${password}`);
    console.log("hashedPassword is:", hashedPassword.hash);
    return hashedPassword;
  } catch (err) {
    logger.error("some error happened", err);
  }
}

export default { hashPassword, verifyHash };
