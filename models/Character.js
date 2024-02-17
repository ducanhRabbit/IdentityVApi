const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Character = new Schema({
  fullName: { type: String, required: true ,unique: true},
  career: { type: String, required: true },
  role: { type: String, required: true },
  birth: { type: String, required: true },
  backStory: { type: String, required: true },
  interests: { type: String, required: true },
  talents: { type: String, required: true },
  likes: { type: String, required: true },
  photo: { type: String, required: true },
  portrait: { type: String, required: true },
  
});

module.exports = mongoose.model("characters", Character);
