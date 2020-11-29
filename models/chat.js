const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    with: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", ChatSchema);
