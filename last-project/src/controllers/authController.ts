import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction, CookieOptions } from "express";
import AppError from "../utils/AppError";
import { IUser, User } from "../models/user";
import catchAsync from "../utils/catchAsync";

const JWT_EXPIRES = "15m"; // Short-lived tokens, because who likes long waits? 😜
const REFRESH_TOKEN_EXPIRES = "7d"; // The refresh token gets to hang out a bit longer, 7 days, lucky guy.

// Generate JWT token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: JWT_EXPIRES,
  });
};

// Cookie options
const cookieOptions: CookieOptions = {
  expires: new Date(Date.now() + 3600000), // 1 hour from now
  httpOnly: true,
  sameSite: "strict", // Can be 'strict', 'lax', or 'none'
  secure: process.env.NODE_ENV === "production", // Only secure cookies in production
};

// Send JWT and refresh token in the response
const sendResponse = async (res: Response, user: any, code: number): Promise<void> => {
  const token = generateToken(user._id);
  const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN as string, {
    expiresIn: REFRESH_TOKEN_EXPIRES,
  });

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  // Update user with refresh token
  const updated = await User.findByIdAndUpdate(user._id, { refreshToken });
  console.log(updated, "Updated");

  res.cookie("jwt", refreshToken, cookieOptions);

  user.password = undefined; // Don’t send password in the response
  res.status(code).json({ status: "success", token, data: { user } });
};

// Login handler
export const login = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) return next(new AppError("Please provide email and password", 400));

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) return next(new AppError("Incorrect email or password", 401));

  sendResponse(res, user, 200);
});

// Register handler
export const register = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const newUser = await User.create({ email: req.body.email, password: req.body.password, name: req.body.name });

  if (!newUser) return next(new AppError("Something went wrong", 400));

  sendResponse(res, newUser, 201);
});

// Protect middleware
interface IDecoded {
  id: string;
  iat: number;
}
export const protect = catchAsync(
  async (
    req: Request extends { user: IUser } ? Request & { user: IUser } : Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    let token = "";
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) return next(new AppError("You are not logged in. Please log in to get access", 401));

    const decoded: IDecoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload extends {
      id: string;
      iat: number;
    }
      ? JwtPayload
      : never;
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) return next(new AppError("The user belonging to this token does no longer exist", 401));
    if (currentUser.changedPasswordAfter(decoded?.iat)) {
      return next(new AppError("User recently changed password. Please log in again", 401));
    }
    //@ts-ignore
    req.user = currentUser;
    next();
  }
);

// Refresh token handler
export const refresh = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const refreshToken = req.cookies.jwt;
  if (!refreshToken) return next(new AppError("You are not logged in. Please log in to get access", 401));

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN as string, async (err: any, decoded: any) => {
    if (err) return next(new AppError("Refresh token is not valid", 403));

    const existingUser: IUser | null = await User.findById(decoded.id);
    if (!existingUser) return next(new AppError("Refresh token is not valid", 403));

    const token = generateToken(existingUser._id as string);
    return res.status(200).json({ status: "success", token, data: { user: existingUser } });
  });
});

// Logout handler
export const logout = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  if (!req.cookies.jwt) {
    return res.status(204).json({ status: "success" });
  }

  const refreshToken: string = req.cookies.jwt;

  const user = await User.findOne({ refreshToken });

  if (!user) {
    res.clearCookie("jwt", cookieOptions);
    return res.status(204).json({ status: "success" });
  }

  user.refreshToken = "";
  await user.save();

  res.clearCookie("jwt", cookieOptions);
  return res.status(200).json({ status: "success" });
});
