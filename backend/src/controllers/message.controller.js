import cloudinary from "../lib/cloudinary.js";
import { getRecieverSocketId, io } from "../lib/socket..js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUserInSidebar = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const filteredUser = await User.find({
      _id: {
        $ne: currentUserId,
      },
    }).select("-password");

    res.json(filteredUser);
  } catch (error) {
    console.log(" Error in getting user in sidebar", error.message);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: chattingToUser } = req.params;
    const chattingFromUser = req.user._id;

    const messages = await Message.find({
      $or: [
        {
          senderId: chattingFromUser,
          receiverId: chattingToUser,
        },
        {
          senderId: chattingToUser,
          receiverId: chattingFromUser,
        },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in fetching the messages:", error.message);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;

    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // realtime goes socket.io

    const receiverSocketId = getRecieverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log(" Error in sending the message:", error.message);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};
