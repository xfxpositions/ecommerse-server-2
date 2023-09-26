import mongoose, { InferSchemaType, Schema, model } from "mongoose";
import IUser from "../types/user";
import Roles from "../types/roles";
import uniqueValidatior from "mongoose-unique-validator";
import validator from "validator";
import passwordValidator from "password-validator";
import hashPasswordUtil from "../utils/hashPassword";
import IHashedPassword from "../types/hashedPassword";
import logger from "../logger";
import isEmpty from "is-empty";

var passwordSchema = new passwordValidator();
passwordSchema
  .min(8)
  .max(128)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .not()
  .spaces()
  .is()
  .not();

var userNameSchema = new passwordValidator();
userNameSchema.lowercase().max(32).min(3).has().not().spaces();

const userSchema: Schema = new Schema<IUser>({
  role: {
    type: String,
    enum: Object.values(Roles),
    required: true,
    default: Roles.Customer,
  },
  userId: { type: Number, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true, validator: passwordSchema },
  passwordSalt: { type: Buffer, required: true },
  adresses: {
    type: [String],
    required: false,
    default: [],
    // max len is 10
    validator: (v) => Array(v).length <= 10,
  },
  phone: {
    type: Number,
    required: false,
    unique: true,
    validator: [validator.isMobilePhone, "Please fill a valid phone number"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validator: [validator.isEmail, "Please fill a valid email address"],
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

type User = InferSchemaType<typeof userSchema>;

userSchema.plugin(uniqueValidatior);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const hashedPassword: IHashedPassword = await hashPasswordUtil.hashPassword(
      this.password
    );
    // override the cleartext password with the hashed one
    this.password = hashedPassword.hash;
    this.passwordSalt = hashedPassword.saltKey;
  } catch (err) {
    logger.error("some error happened at saving user", err);
    return next(err);
  }
});

// compare passwords
userSchema.methods.verifyHash = function (
  id: mongoose.ObjectId,
  password: string,
  cb: any
): boolean {
  try {
    User.findById(id)
      .then(async (result: User) => {
        if (isEmpty(result)) return cb({ err: "User not found", code: 404 });
        const userPassword: string = result.password;
        const saltKey = result.passwordSalt;

        try {
          const verifyResult = await hashPasswordUtil.verifyHash(
            userPassword,
            password,
            saltKey
          );
          return verifyResult;
        } catch (err) {
          logger.error("some error happened at comparing passwords", err);
          return cb(err);
        }
      })
      .catch((err) => {
        logger.error("some error happened at comparing passwords", err);
        return cb(err);
      });
  } catch (err) {
    logger.error("some error happened at comparing passwords", err);
    return cb(err);
  }
};

const User = model("User", userSchema);

export default User;
