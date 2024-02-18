

const mongoose = require("mongoose");

const connectToDb = async () => {
  try {
    await mongoose
      .connect(process.env.MONGODB_URL)
      .then(() => console.log("Connect successfully!"))
      .catch((err) => console.log("Connect failure " + err));
  } catch {
    (err) => {
      console.log("Connect Failure");
    };
  }
};

module.exports = {connectToDb}
