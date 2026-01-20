import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import {asyncHandler} from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const generateAcessAndrefreshToken = asyncHandler(async(userId)=>{
  try {
    const user = await user.findById(userId)
    const accesstoken = generateAcessToken()
    const refreshtoken = generateRefreshToken()

    user.refreshToken = refreshtoken
    await user.save({validateBeforeSave: false})

    return {accesstoken,refreshtoken}
    
  } catch (error) {
    throw new ApiError(500, "error while generating access and refresh token")
  }
})

const registerUser = asyncHandler(async (req, res) => {

  const { userName, fullName, email, password } = req.body;

  if ([userName, fullName, email, password].some(field => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (existedUser) {
    throw new ApiError(400, "User with username or email already exists");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar upload failed");
  }

  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  const user = await User.create({
    userName: userName.toLowerCase(),
    fullName,
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || ""
  });

  const createdUser = await User.findById(user._id)
    .select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
  );
});

const loginUser = asyncHandler(async (req , res)=>{
  // get username , email etc from req.body 
  // check if already registered if not then send register first 
  // if registered check for credentials 
  // if correct give accesstoken and refreshtoken 

  const {userName, email , fullName} = req.body 

  if(!userName && !email){
    throw new ApiError(404, "username and email is required")
  }
  const user = await user.findOne({
    $or:[{userName},{email}]
  })

  if(!user){
    throw new ApiError(404, "user does not exists")
  }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if(!isPasswordValid){
    throw new ApiError(404 ,"Invalid Credentials !!")
  }

  const {accessToken, refreshToken} = await generateAcessAndrefreshToken(user._id)

  const loggedIn = await user.findById(user._id).select("-password -refreshtoken")

  const options={
    httpOnly: true ,
    secure: true 
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken ,options)
  .cookie("refreshToken", refreshToken ,options)
  .json(
    new ApiResponse( 
      200,
      {
        user:loggedIn, accesstoken,refreshtoken
      },
      "user loggedIn successfully"
    )
  )
})

const logout = asyncHandler(async(req,res)=>{
  req.user._id,
  {
    $unset:{
      refreshToken:1
    }
  }

})


export {
    registerUser,
    loginUser,
    
}