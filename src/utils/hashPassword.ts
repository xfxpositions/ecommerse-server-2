import argon2, { hash } from "argon2";
import { randomBytes } from "crypto";
import IHashedPassword from "../types/hashedPassword";
import logger from "../logger";

async function hashPassword(password: string): Promise<IHashedPassword> {
  const saltKey = randomBytes(32);

  try {
    const hash = await argon2.hash(password, { salt: saltKey });
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

async function verifyHash(hash: string, password: string, salt: Buffer) {
  try {
    const result = await argon2.verify(hash, password, { salt: salt });
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
