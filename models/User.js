const mongoose = require("mongoose");
const { Schema } = mongoose;
const Inspiration = require("./Inspiration");

const User = new Schema({
  firstName: { type: String },
  lastName: { type: String },
  userName:{type:String},
  story:{type:String, default:""},
  email: { type: String,default:''},
  passWord: { type: String },
  refreshToken: { type: String },
  uid: { type: String, default: "" },
  photo:{type: String},
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  following: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  save:[{
    type:Schema.Types.ObjectId,
    ref:"Inspiration"
  }],
  notification: [
    {
      senderName: { type: String },
      action: { type: Number },
      inspirationID: { type: Schema.Types.ObjectId, ref: Inspiration },
      read: { type: Boolean, default: false },
    },
  ],
  token: { type: String },
});

User.methods.isPasswordMatched = function (password) {
  console.log(this.passWord);
  return password === this.passWord;
};

module.exports = mongoose.model("User", User);
