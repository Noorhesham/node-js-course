import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";

// Define the IUser interface with Document properties
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  passwordChangeAt?: Date;
  role: "user" | "admin";
  isAdmin: boolean;
  refreshToken: string;
  comparePassword(password: string): Promise<boolean>;
  changedPasswordAfter(JWTTimestamp: number): boolean;
  createdAt: Date;
}

// Define the User schema
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    createdAt: { type: Date, default: Date.now },
    passwordChangeAt: { type: Date },
    isAdmin: { type: Boolean, default: false },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Track password change time
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangeAt = new Date(Date.now() - 1000); // prevent issues with timing
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

// Method to check if the password was changed after a given JWT timestamp
userSchema.methods.changedPasswordAfter = function (JWTTimestamp: number): boolean {
  if (this.passwordChangeAt) {
    const changedTimeStamp = this.passwordChangeAt.getTime() / 1000;
    return JWTTimestamp < changedTimeStamp;
  }
  return false; // if no password change date, return false
};

// Create and export the User model
export const User = model<IUser>("User", userSchema);
