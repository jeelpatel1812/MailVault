import {apiResponse} from '../utils/apiResponse.js'
import {asyncHandler} from '../utils/asyncHandler.js'

const registerController = asyncHandler(async(req, res)=>{
    return res
        .json(new apiResponse(200, "ok", "User Registered."))
});

export default registerController;