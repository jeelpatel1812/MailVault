import mongoose, {Schema} from 'mongoose';

const userSchema = new Schema(
    {
        email: {
            type: String,
            trim: true,
            index: true,
            unique: true,
            required: true
        },
        password: String,
        refreshToken: String,
        userName: String,
        profileImage: String,
        status: String
    }, {timestamps: true}
)

export const User = mongoose.model("User", userSchema);