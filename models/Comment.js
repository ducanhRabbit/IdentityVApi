const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Comment = new Schema({
  comment: { type: String, required: true },
  createAt: {
    type: Date,
    default: new Date(),
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  replies: [
    {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      comment: { type: String},
      createAt: {
        type: Date,
        default: new Date(),
      },
      likes: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
  ],
});

module.exports = mongoose.model("Comment", Comment);
