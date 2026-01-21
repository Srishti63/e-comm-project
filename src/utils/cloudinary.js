import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { asyncHandler } from "./asyncHandler";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET 

});

const uploadOnCloudinary = async(LocalFilePath)=>
    {
        try {
            if(!LocalFilePath) return null
            const response = await cloudinary.uploader.upload(LocalFilePath,{
                resource_type: "auto"
            })
           // console.log("file is uploaded on cloudinary ", response.url);
           fs.unlink(LocalFilePath)
            return response;
        } catch (err) {
            fs.unlink(LocalFilePath)
            return null;   
        }
}

const deleteVideoFromCloudinary = async(publicId , resuourceType= "video")=>
    {
        try {
            return await cloudinary.uploader.destroy(publicId,{
                resource_type : resuourceType
            })
        } catch (error) {
            return null ;
        }
};

export { 
    uploadOnCloudinary,
    deleteVideoFromCloudinary
 }