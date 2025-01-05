import ApiResponse from '../utils/apiResponse.js'
import ApiError from '../utils/apiError.js'
import AsyncHandler from '../utils/asyncHandler.js'
import { User } from '../models/users.model.js';
import jwt from 'jsonwebtoken';

const registerController = AsyncHandler(async(req, res)=>{
    const {email, password, name} = req.body;

    if([email, password].some((field)=>{field.trim() === ""})){
        throw new ApiError(400, "All field are required.")
    }
    const isUserExist = await User.findOne({email});
    if(isUserExist) throw new ApiError(409, "User already exist with this email.");
    
    const user = await User.create({
        email,
        password,
        name
    });
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if(!createdUser) throw new ApiError(500, "Something went wrong.");

    return res.json(new ApiResponse(201, createdUser, "User is created succesfully."))

});

const generateAccessAndRefreashToken = async (userId)=>{
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken
        await user.save();
        return {accessToken, refreshToken};
    }
    catch(err){
        throw new ApiError(500, "Something went wrong while generating access and refresh token.");
    }
}

const loginController = AsyncHandler(async(req, res)=>{

    const {email, password} = req.body;

    if(!email || !password){
        throw new ApiError(400, "email and password is essential.");
    }


    const user = await User.findOne({email});

    if(!user) throw new ApiError(404, 'User not found.');

    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid) throw new ApiError(401, 'Invalid credential.')

    const {accessToken, refreshToken} = await generateAccessAndRefreashToken(user._id);

    const loggedUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly:  true,
        secure: true
    }

    return res
    .status(200)
    .cookie('accesstToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedUser, accessToken, refreshToken
            },
            'User logged in successfully.'
        )
    )
});

const refreshAcessToken = AsyncHandler(async(req, res)=>{
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken) throw new ApiError(401, 'unauthorized request.');

    try{
        const decodedToken = jwt.verify(incomingRefreshToken, process.env, REFRESH_TOKEN_SECRET); 
        const user = await User.findById(decodedToken?._id);

        if(!user || incomingRefreshToken !== user?.refreshToken) throw new ApiError(401, 'Invalid refresh token.');

        const options = {
            http: true,
            secure: true
        }

        const {accessToken, newRefreshToken} = await generateAccessAndRefreashToken(user._id);

        return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(200,
                { accessToken, refreshToken: newRefreshToken},
                'access token is refreshed.'
            )
        )
    }
    catch(err){
        throw new ApiError(401, 'invalid refresh token.');
    }

})

const logoutController = AsyncHandler(async(req, res)=>{
    const user = req.user;
    User.findByIdAndUpdate(user?._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {new: true}
    )
    const options={
        http: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, "User logged out successfully."))
})

export {registerController, loginController, refreshAcessToken, logoutController};