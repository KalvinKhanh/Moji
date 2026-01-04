import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import User from "../models/User.ts";
import jwt from "jsonwebtoken";
import crypto, { setEngine } from "crypto";
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
    const { username, password } = req.body;

    // 1. Kiểm tra đầu vào
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ tài khoản và mật khẩu" });
    }

    // 2. TÌM USER TRONG DATABASE (Dòng này cực kỳ quan trọng)
    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Tài khoản hoặc mật khẩu không chính xác" });
    }

    // 3. SO SÁNH MẬT KHẨU
    // user.hashedPassword là chuỗi đã băm lấy từ DB ra
    const isMatch = await bcrypt.compare(password, user.hashedPassword);

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Tài khoản hoặc mật khẩu không chính xác" });
    }

    // 4. TẠO ACCESS TOKEN (Nếu mọi thứ đều đúng)
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET!, // Đừng quên dấu ! và kiểm tra đúng chính tả SECRET
      { expiresIn: "15m" } // Token có hiệu lực trong 15 phút
    );

    // 5. TRẢ VỀ KẾT QUẢ
    return res.status(200).json({
      message: "Đăng nhập thành công",
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
      },
    });
  } catch (error) {
    // Quan trọng: In lỗi ra Terminal để bạn biết chính xác lỗi gì (ví dụ: thiếu thư viện, sai biến .env)
    console.error("Lỗi tại signIn:", error);
    return res.status(500).json({ message: "lỗi hệ thống" });
  }
};

export const signOut = async (req: Request, res: Response) => {
  try {
    //lấy refreshtoken từ cookies
    const token = req.cookies?.refreshToken;
    if (token) {
      //xóa refreshtoken từ trong session
      await Session.deleteOne({ refreshToken: token });
      //xóa refreshtoken trong cookies
      res.clearCookie("refreshToken");
    }
    return res.sendStatus(204);
  } catch (error) {
    console.log("Lỗi khi gọi signOut", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
