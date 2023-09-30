import mongoose, { Schema, model, Document, Model } from "mongoose";
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
console.log(
  isEmpty(passwordSchema.validate("kirwa_$)#99_w", { details: true }))
);

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
    validate: {
      validator: (v: any) => {
        console.log(v);
        return userNameSchema.validate(v, { details: true });
      },
    },
  },
  name: { type: String, required: true },
  password: {
    type: String,
    required: true,
    validate: {
      validator: (v) => {
        console.log(v);
        const validationErrors = passwordSchema.validate(v, { list: true });
        return validationErrors.length === 0;
      },
      message: (v) => {
        console.log(passwordSchema.validate(v.value, { details: true }));
        const validationErrors = passwordSchema.validate(v.value, {
          details: true,
        });
        return validationErrors.map((error) => error.message).join(", ");
      },
    },
  },
  passwordSalt: { type: String, required: false },
  adresses: {
    type: [String],
    required: false,
    default: [],
    validate: (v: string[]) => v.length <= 10,
  },
  phone: {
    type: String,
    required: false,
    validate: {
      validator: (value: string) => {
        if (value !== "") {
          return validator.isMobilePhone(value);
        }
        return true; // Allow empty string
      },
      message: "Please fill a valid phone number",
    },
    default: "",
    unique: true, // Set the field as unique
    sparse: true, // Allow multiple documents with empty strings
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

// defining user methods
interface IUserMethods {
  verifyHash(hash: string): Promise<boolean>;
}

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

type UserModel = Model<IUser, {}, IUserMethods>;

const UserModel = model<IUser & Document, UserModel>("User", userSchema);

export default UserModel;
