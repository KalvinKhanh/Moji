import bcrypt from "bcrypt";
import { Request, Response } from "express";
import User from "../models/User.ts";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Session from "../models/Session.ts";
const ACCESS_TOKEN_TTL = "30m"; //thường là dưới 15m
//nếu như là app ngân hàng thì chỉ dưới 1p
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; //14 ngày
export const signUp = async (req: Request, res: Response) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;
    if (!username || !password || !email || !firstName || !lastName) {
      return res.status(400).json({
        message: "Không thể thiếu username, password, firstName, và lastName",
      });
    }

    //kiểm tra username tồn tại chưa
    const duplicate = await User.findOne({ username });

    if (duplicate) {
      return res.status(409).json({ message: "username đã tồn tại" });
    }
    //mã hóa password
    const hashedPassword = await bcrypt.hash(password, 10); // salt = 10
    //tạo user mới
    await User.create({
      username,
      hashedPassword,
      email,
      displayName: `${firstName} ${lastName}`,
    });
    //return
    return res.sendStatus(204);
  } catch (error) {
    console.error("Lỗi khi gọi signUp", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const signIn = async (req: Request, res: Response) => {
  try {
    //lấy inputs
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(4000)
        .json({ message: "thiếu username hoặc password." });
    }
    //lấy hashedPassword trong db để so với pasword input
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(401)
        .json({ message: "username hoặc password không chính xác" });
    }

    //kiểm tra password
    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordCorrect) {
      return res
        .status(401)
        .json({ message: "username haoc85 password không chính xác" });
    }
    //nếu khớp, tạo accessToken với JWT
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.ACCESS_TOKEN_SECRECT as string,
      { expiresIn: ACCESS_TOKEN_TTL }
    );
    //tạo refresh token
    const refreshToken = crypto.randomBytes(64).toString("hex");
    //tạo session mới để lưu refresh token
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none", //backend, frontend deploy riêng
      maxAge: REFRESH_TOKEN_TTL,
    });
    //trả refresh token về trong cookie
    // trả access token về trong res
    return res
      .status(200)
      .json({ message: `User ${user.displayName} đã log in!!`, accessToken });
  } catch (error) {
    console.error("lỗi khi gọi signIn", error);
    return res.status(500).json({ message: "lỗi hệ thống" });
  }
};
