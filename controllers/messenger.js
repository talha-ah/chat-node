// Import Models
const User = require("../models/user");
const Chat = require("../models/chat");
const Message = require("../models/message");
const IOInstance = require("../socket/socket");

const mongoose = require("mongoose");

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
    const page = req.body.page || 1;

    const chatLength = await Chat.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(chatId) } },
      {
        $project: {
          total_messages: {
            $size: "$messages",
          },
        },
      },
    ]);

    const chat = await Chat.findOne(
      { _id: chatId },
      {
        messages: {
          $slice: [-10 * page, 10],
        },
      }
    )
      .populate("user")
      .populate("with")
      .populate("messages")
      .exec();

    if (!chat) {
      const err = new Error("There was an error!");
      err.status = 404;
      throw err;
    }

    res.status(200).json({
      chat: {
        ...chat.toObject(),
        total_messages: chatLength[0].total_messages,
      },
    });
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
    const chatCheck = await Chat.findOne({
      user: userId,
      with: withId,
    });
    if (chatCheck) {
      res.status(200).json({ found: true, chat: chatCheck });
    } else {
      const chat = new Chat({
        user: userId,
        with: withId,
      });
      const chatCreated = await chat.save();

      res.status(200).json({ created: true, chat: chatCreated });
    }
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
    const receiverId = req.body.receiverId;

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
    await chat.save();

    const socketUser = IOInstance.getUserById(receiverId);
    if (socketUser) {
      socketUser.socket.emit("message", {
        action: "create",
        message: messageCreated,
      });
    }

    res.status(200).json({ created: true, message: messageCreated });
  } catch (err) {
    if (!err.status) {
      err.status = 500;
    }
    next(err);
  }
};
// let users = [];
// io.on('connection', socket => {
//   socket.on('joinRoom', ({ username, room }) => {
//     const user = { id: socket.id, username, room };
//     users.push(user);

//     socket.join(user.room);

//     // Welcome current user
//     socket.emit('message', 'Welcome to ChatCord!');

//     // Broadcast when a user connects
//     socket.broadcast
//       .to(user.room)
//       .emit(
//         'message',
//         formatMessage(botName, `${user.username} has joined the chat`)
//       );

//     // Send users and room info
//     io.to(user.room).emit('roomUsers', {
//       room: user.room,
//       users:  users.filter(user => user.room === user.room)
//     });
//   });

//   // Listen for chatMessage
//   socket.on('chatMessage', msg => {
//     const user = users.find(user => user.id === socket.id)

//     io.to(user.room).emit('message', formatMessage(user.username, msg));
//   });

//   // Runs when client disconnects
//   socket.on('disconnect', () => {
//     let user;
//     const index = users.findIndex(user => user.id === socket.id);

//     if (index !== -1) {
//       user = users.splice(index, 1)[0];
//     }

//     if (user) {
//       io.to(user.room).emit(
//         'message',
//         formatMessage(botName, `${user.username} has left the chat`)
//       );

//       // Send users and room info
//       io.to(user.room).emit('roomUsers', {
//         room: user.room,
//         users: users.filter(user => user.room === user.room)
//       });
//     }
//   });
// });

// ===========================================================================

//   db.students.update(
//     { _id: 5 },
//     {
//       $push: {
//         quizzes: {
//            $each: [ { wk: 5, score: 8 }, { wk: 6, score: 7 }, { wk: 7, score: 6 } ],
//            $sort: { score: -1 },
//            $slice: 3
//         }
//       }
//     }
//  )

//   Message.aggregate(
//     [
//         { "$match": { "to": user } },
//         { "$sort": { "date": 1 } },
//         { "$group": {
//             "_id": "from",
//             "to": { "$first": "$to" },
//             "message": { "$first": "$message" },
//             "date": { "$first": "$date" },
//             "origId": { "$first": "$_id" }
//         }},
//         { "$lookup": {
//              "from": "users",
//              "localField": "from",
//              "foreignField": "_id",
//              "as": "from"
//         }},
//         { "$lookup": {
//              "from": "users",
//              "localField": "to",
//              "foreignField": "_id",
//              "as": "to"
//         }},
//         { "$unwind": { "path" : "$from" } },
//         { "$unwind": { "path" : "$to" } }
//     ],
//     function(err,results) {
//         if (err) throw err;
//         return results;
//     }
// )
