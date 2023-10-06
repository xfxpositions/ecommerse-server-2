import { Schema, model, Document, Model } from "mongoose";
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
      validator: (v: any) => {
        console.log(v);
        const validationErrors = passwordSchema.validate(v, { list: true });
        if (typeof validationErrors == "boolean") {
          return validationErrors;
        }
        return validationErrors.length === 0;
      },
      message: (v) => {
        console.log(passwordSchema.validate(v.value, { details: true }));
        const validationErrors = passwordSchema.validate(v.value, {
          details: true,
        });
        return validationErrors.map((error: any) => error.message).join(", ");
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
    sparse: true,
    unique: true,
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
      unique: true,
      validate: {
        validator: async function (value: string) {
          if (value !== "") {
            // Check if the value is a valid phone number
            if (!validator.isMobilePhone(value)) {
              throw new Error("Please fill a valid phone number");
            }

            // Check for uniqueness among non-empty phone values
            const existingUser = await UserModel.findOne({ phone: value });
            if (existingUser) {
              throw new Error("Phone number is already in use");
            }
          }
        },
      },
    },
  },
});

userSchema.method(
  "verifyHash",
  async function verifyHash(password: string): Promise<boolean> {
    const userPassword: string = this.password;
    const saltKey: string = this.passwordSalt || "";

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
  }
);

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
type UserModel = Model<IUser, {}, IUserMethods>;

const UserModel = model<IUser, UserModel>("User", userSchema);
export default UserModel;
