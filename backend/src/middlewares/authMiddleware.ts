import jwt from "jsonwebtoken";
import User from "../models/User.ts";
import { Request, Response, NextFunction } from "express";

// 1. Khai báo Interface cho Payload
interface MyTokenPayload extends jwt.JwtPayload {
  userId: string;
}

interface CustomRequest extends Request {
  user?: any;
}

export const protectedRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Không tìm thấy token" });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, async (err, decoded) => {
    if (err || !decoded) return res.status(403).json({ message: "Token sai" });

    const payload = decoded as MyTokenPayload;
    const user = await User.findById(payload.userId).select("-hashedPassword");

    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    (req as any).user = user;
    next();
  });
};
