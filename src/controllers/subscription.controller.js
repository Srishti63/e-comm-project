import { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id");
    }

    if (req.user._id.equals(channelId)) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }

    const subscriberId = req.user._id;

    const existingSubscription = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
    });

    if (existingSubscription) {
        await Subscription.deleteOne({ _id: existingSubscription._id });

        return res.status(200).json(
            new ApiResponse(
                200,
                { isSubscribed: false },
                "Unsubscribed successfully"
            )
        );
    }

    await Subscription.create({
        subscriber: subscriberId,
        channel: channelId
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            { isSubscribed: true },
            "Subscribed successfully"
        )
    );
});

const getUserChannelSubscribers = asyncHandler(async(req,res)=>{
    const {channelId} = req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, " Invalid channelId")
    }

    const subscriptions = await Subscription.find({
        channel : channelId
    }).populate("subscriber","username avatar");

    const subscribers = subscriptions.map(
        (subscription)=>(subscription.subscribers)
    )
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                count : subscribers.length,
                subscribers
            },
            "Channel Subscribers fetched successfully"
        )
    )

})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber id");
    }

    const subscriptions = await Subscription.find({
        subscriber: subscriberId
    }).populate("channel", "username avatar");

    const channels = subscriptions.map(
        (subscription) => subscription.channel
    );

   
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                count: channels.length,
                channels
            },
            "Subscribed channels fetched successfully"
        )
    );
});



export { 
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
 };
