import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./libs/db";
import authRoute from "./routes/authRoute";
import cookieParser from "cookie-parser";
import userRoute from "./routes/userRoute";
import { protectedRoute } from "./middlewares/authMiddleware";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// 1. Middlewares chung
app.use(express.json());
app.use(cookieParser());
// 2. PUBLIC ROUTES (Không cần token)
// Đặt authRoute lên trước middleware bảo vệ
app.use("/api/auth", authRoute);
// 3. MIDDLEWARE BẢO VỆ (Kể từ dòng này trở xuống, mọi request đều phải có Token)
app.use(protectedRoute);
// 4. PRIVATE ROUTES (Cần token)
app.use("/api/users", userRoute);
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`server bắt đầu trên cổng ${PORT}`);
  });
});
