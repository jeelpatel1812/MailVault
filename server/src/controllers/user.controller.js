import ApiResponse from '../utils/apiResponse.js'
import ApiError from '../utils/apiError.js'
import AsyncHandler from '../utils/asyncHandler.js'
import { User } from '../models/users.model.js';

const registerController = AsyncHandler(async(req, res)=>{
    const {email, password} = req.body;

    console.log("step0");
    if([email, password].some((field)=>{field.trim() === ""})){
        throw new ApiError(400, "All field are required.")
    }
    const isUserExist = await User.findOne({email});
    if(isUserExist) throw new ApiError(409, "User already exist with this email.");
    
    const user = await User.create({
        email,
        password
    });
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if(!createdUser) throw new ApiError(500, "Something went wrong.");

    return res.json(new ApiResponse(200, createdUser, "User is created succesfully."))

});

const loginController = AsyncHandler(async(req, res)=>{
    
});

export {registerController, loginController};