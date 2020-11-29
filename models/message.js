const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    name: String,
    text: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
