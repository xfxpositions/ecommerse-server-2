import mongoose, { Schema, model, Document } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import validator from "validator";
import passwordValidator from "password-validator";
import hashPasswordUtil from "../utils/hashPassword";
import logger from "../logger";
import isEmpty from "is-empty";
import Roles from "../types/roles";
import IUser from "../types/user";
import IHashedPassword from "../types/hashedPassword";

const passwordSchema = new passwordValidator();
passwordSchema
  .is()
  .min(8)
  .max(128)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .not()
  .spaces();

const userNameSchema = new passwordValidator();
userNameSchema.lowercase().max(32).min(3).has().not().spaces();

const userSchema: Schema<IUser & Document> = new Schema({
  role: {
    type: String,
    enum: Object.values(Roles),
    required: true,
    default: Roles.Customer,
  },
  userId: { type: Number, required: true, unique: true },
  username: {
    type: String,
    required: true,
    unique: true,
    validate: userNameSchema.validate.bind(userNameSchema),
  },
  name: { type: String, required: true },
  password: {
    type: String,
    required: true,
    validate: passwordSchema.validate.bind(passwordSchema),
  },
  passwordSalt: { type: String, required: true },
  adresses: {
    type: [String],
    required: false,
    default: [],
    validate: (v: string[]) => v.length <= 10,
  },
  phone: {
    type: Number,
    required: false,
    unique: true,
    validate: {
      validator: (value: number) => validator.isMobilePhone(String(value)),
      message: "Please fill a valid phone number",
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (value: string) => validator.isEmail(value),
      message: "Please fill a valid email address",
    },
  },
  verified: {
    email: {
      type: Boolean,
      required: false,
    },
    phone: {
      type: Boolean,
      required: false,
    },
  },
});

userSchema.plugin(uniqueValidator);

userSchema.pre<IUser & Document>("save", async function (next: Function) {
  if (!this.isModified("password")) return next();
  try {
    const hashedPassword: IHashedPassword = await hashPasswordUtil.hashPassword(
      this.password
    );
    // Override the cleartext password with the hashed one
    this.password = hashedPassword.hash;
    this.passwordSalt = hashedPassword.saltKey;
    next();
  } catch (err) {
    logger.error("Some error happened at saving user", err);
    return next(err);
  }
});

userSchema.methods.verifyHash = async function (
  password: string
): Promise<boolean> {
  const userPassword: string = this.password;
  const saltKey = this.passwordSalt;

  try {
    const verifyResult = await hashPasswordUtil.verifyHash(
      userPassword,
      password,
      saltKey
    );
    return verifyResult;
  } catch (err) {
    logger.error("Some error happened at comparing passwords", err);
    throw err;
  }
};

const UserModel = model<IUser & Document>("User", userSchema);

export default UserModel;
