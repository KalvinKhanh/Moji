import mongoose from "mongoose";

// export interface IUser extends Document {
//   username: string;
//   hashedPassword: string;
//   email: string;
//   displayName: string;
//   avatarUrl?: string; // Dấu ? nghĩa là thuộc tính này có thể có hoặc không (optional)
//   avatarId?: string;
//   bio?: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    hashedPassword: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      unique: true,
    },
    avatarUrl: {
      type: String,
    },
    avatarId: {
      type: String,
    },
    bio: {
      type: String,
      sparse: true, //cho phép null, nhưng không được trùng
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
