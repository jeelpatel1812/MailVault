import jwt from 'jsonwebtoken';
import AsyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import { User } from '../models/users.model.js';

const verifyJWT = AsyncHandler(async(req, res, next)=>{
    const token = req.cookie?.accessToken || req.header("Authorization")?.replace("Bearer ","");

    if(!token) throw new ApiError(401, "Unauthorized without token");
    try{
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select('-password -refreshToken');

        if(!user) throw new ApiError(401, 'Unauthorized user');

        req.user = user;
        next();
    }
    catch(err){
        throw new ApiError(400, err?.message || 'Invalid access token');
    }
})

export default verifyJWT;