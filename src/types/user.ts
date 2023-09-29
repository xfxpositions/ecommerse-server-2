import Roles from "./roles";
import { Document } from "mongoose";

interface IUser extends Document {
  role: Roles;
  id: string;
  userId: Number;
  username: string;
  name: string;
  roles: string[];
  password: string;
  passwordSalt?: string;
  adresses?: string[];
  phone?: string;
  email: string;
  verified: {
    email: boolean;
    phone: boolean;
  };
}

export default IUser;
