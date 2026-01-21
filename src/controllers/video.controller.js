import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteVideoFromCloudinary } from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        sortType = "desc",
        query,
        sortBy = "createdAt",
        userId
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const filter = { isPublished: true };

    if (query) {
        filter.title = { $regex: query, $options: "i" };
    }

    if (userId && isValidObjectId(userId)) {
        filter.owner = userId;
    }

    const sort = {
        [sortBy]: sortType === "asc" ? 1 : -1
    };

    const videos = await Video.find(filter)
        .sort(sort)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                page: pageNum,
                results: videos.length,
                videos
            },
            "Videos fetched successfully"
        )
    );
});

const publishVideo = asyncHandler(async (req,res)=>{
    const {title, description}= req.body

    if(!title || title.trim()==" "){
        throw new ApiError(400,"title is required")
    }

    if(!req.file){
        throw new ApiError(400,"video file is required ")
    }

    const userId = req.user._id;

    const uploadvideo = await uploadOnCloudinary(req.file.path,"video");

    if(!uploadvideo){
        throw new ApiError(400,"video upload failed")
    };

    const video = await video.create({
        title,
        description,
        videoUrl : uploadvideo.secure_url,
        cloudinaryId : uploadvideo.public_id,
        owner: userId,
        isPublished: false,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            "video uploaded successfully",
        )
    )  
})

const getvideoById= asyncHandler(async(req,res)=>{
    const {videoId}= req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "invalid videoID")
    }

    const video = await Video.findById(videoId)

    if(!video || !video.isPublished){
        throw new ApiError(400,"No published video found")
    }

    return res.status(200).json(
        200,
        video,
        "Video fetched successfully"
    );
})

const updateVideo = asyncHandler(async(req,res)=>{
    const {videoId}= req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "invalid videoID")
    }

    const video = await Video.findById(videoId)

    if(!video || !video.isPublished){
        throw new ApiError(404,"No published video found")
    }

    if(!video.owner.equals(req.user._id)){
        throw new ApiError(403,"You are not allowed to update this video")
    }
    const {title, description}= req.body;

    if(!title && !description){
        throw new ApiError(400 ,"Nothing to update!")
    }

    if(title){
        if(title.trim()===""){
            throw ApiError(404, "title can't be empty")
        }
        video.title = title
    };

    if(description){
        video.description = description 
    }
    await video.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200,
        video,
        "video is updated successfully"
        )
    )
})

const deleteVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Not a valid videoId")
    }
    const video = await video.findById(videoId)

    if(!video || !video.isPublished){
        throw new ApiError(404, "No video Found")
    }
    if(!video.owner.equals(req.user._id)){
        throw new ApiError(403,"You are not allowed to delete the video")
    }
    const cloudinaryResult = deleteVideoFromCloudinary(
        video.cloudinaryId,
        "video"
    )
    if(!cloudinaryResult){
        throw new ApiError(400, "Failed to delete the video from storage")
    }

    await video.deleteOne();

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Video deleted successfullly"
        )
    )
})

const togglePublishStatus = asyncHandler(async(req,res)=>{
    const {videoId} = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Not a valid videoId")
    }
    const video = await video.findById(videoId)

    if(!video || !video.isPublished){
        throw new ApiError(404, "No video Found")
    }
    if(!video.owner.equals(req.user._id)){
        throw new ApiError(403,"You are not allowed to toggle the status of the video")
    }

    video.isPublished  = !(video.isPublished)

    await video.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {isPublished : video.isPublished },
            "Video toggled successfullly"
        )
    )
})

export { getAllVideos ,
        publishVideo,
        getvideoById,
        updateVideo,
        deleteVideo,
        togglePublishStatus
};
