const User = require("../models/User");
const jwt = require("jsonwebtoken");

const authenMiddleware = async (req, res, next) => {
  try {
    let token;

    if (req?.headers?.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
      console.log(token)
      try {
        if (token) {
          const decode = jwt.verify(
            token,
            process.env.SERCRET_KEY
          );
          console.log(decode)
          const user = await User.findOne({ uid: decode.id });
          req.user = user;
          next();
        }
      } catch (err) {
        throw new Error("Token expired, please log in again");
      }
    } else {
      throw new Error("No token!");
    }
  } catch (err) {
    next(err);
  }
};

module.exports = { authenMiddleware };
