const mongoose = require("mongoose");
const User = require("./User");
const Schema = mongoose.Schema;

const Inspiration = new Schema({
  title: { type: String },
  plainTitle: { type: String },
  description: { type: String },
  artworkURL: { type: String, required: true },
  heightImg: { type: Number },
  widthImg: { type: Number },
  isLiked: { type: Boolean, default: false },
  commentPermission:{type: Boolean, default: true},
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  comments: [
    {
      postedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
      comment: { type: String, required: true },
      createAt: {
        type: Date,
        default: Date.now,
      },
      likes: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      replies: [
        {
          comment: { type: String },
          receiver: { type: Schema.Types.ObjectId, ref: "User" },
          createAt: {
            type: Date,
            default: Date.now,
          },
          likes: [
            {
              type: Schema.Types.ObjectId,
              ref: "User",
            },
          ],
          postedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
          },
        },
      ],
    },
  ],
  postedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  
},{
  timestamps:true
});

module.exports = mongoose.model("Inspiration", Inspiration);
