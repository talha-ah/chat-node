// Import Models
const User = require("../models/user");
const Chat = require("../models/chat");
const Message = require("../models/message");

exports.getChats = async (req, res, next) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      const err = new Error("There was an error!");
      err.status = 400;
      throw err;
    }
    const chats = await Chat.find({
      $or: [{ user: userId }, { with: userId }],
    })
      .populate("user")
      .populate("with")
      .exec();
    if (!chats) {
      const err = new Error("There was an error!");
      err.status = 400;
      throw err;
    }

    res.status(200).json({ chats });
  } catch (err) {
    next(err);
  }
};
exports.getChat = async (req, res, next) => {
  try {
    const chatId = req.params.chatId;

    const chat = await Chat.findById(chatId)
      .populate("with")
      .populate("messages")
      .exec();
    if (!chat) {
      const err = new Error("There was an error!");
      err.status = 404;
      throw err;
    }

    res.status(200).json({ chat });
  } catch (err) {
    next(err);
  }
};

exports.createChat = async (req, res, next) => {
  try {
    const userId = req.userId;
    const withId = req.body.withId;

    const user = await User.findById(userId);
    if (!user) {
      const err = new Error("There was an error!");
      err.status = 404;
      throw err;
    }
    const user2 = await User.findById(withId);
    if (!user2) {
      const err = new Error("There was an error!");
      err.status = 404;
      throw err;
    }

    const chat = new Chat({
      user: userId,
      with: withId,
    });
    const chatCreated = await chat.save();

    res.status(200).json({ created: true, chat: chatCreated });
  } catch (err) {
    if (!err.status) {
      err.status = 500;
    }
    next(err);
  }
};
exports.createMessage = async (req, res, next) => {
  try {
    const userId = req.userId;
    const chatId = req.params.chatId;
    const text = req.body.text;

    const user = await User.findById(userId);
    if (!user) {
      const err = new Error("There was an error!");
      err.status = 404;
      throw err;
    }
    const chat = await Chat.findById(chatId);
    if (!chat) {
      const err = new Error("There was an error!");
      err.status = 404;
      throw err;
    }

    const message = new Message({
      user: user._id,
      name: user.firstName + " " + user.lastName,
      text: text,
    });
    const messageCreated = await message.save();
    chat.messages.push(messageCreated._id);
    chat.save();

    res.status(200).json({ created: true, message: messageCreated });
  } catch (err) {
    if (!err.status) {
      err.status = 500;
    }
    next(err);
  }
};
