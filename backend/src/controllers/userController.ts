import { Request, Response, NextFunction } from "express";

export const authMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentUser = (req as any).user;

    if (!currentUser) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin người dùng" });
    }

    return res.status(200).json({
      user: currentUser,
    });
  } catch (error) {
    console.log("Lỗi khi gọi authMe", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
