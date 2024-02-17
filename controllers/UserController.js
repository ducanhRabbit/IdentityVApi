const { json } = require("express");
const jwt = require("jsonwebtoken");
const generateRefreshToken = require("../config/token/refreshToken");
const { generateToken } = require("../config/token/token");
const User = require("../models/User");
const { ObjectId } = require("mongodb");

class UserController {
  // [GET] All user URL:[api/user]
  async getAllUsers(req, res, next) {
    try {
      const users = await User.find()
        .populate({
          path: "followers",
          select: ["firstName", "lastName", "email"],
        })
        .populate({
          path: "following",
          select: ["firstName", "lastName", "email"],
        });
      res.json(users);
    } catch (err) {
      next(err);
    }
  }
  // [GET] Single User URL:[api/user/:id]
  async getUserId(req, res, next) {
    try {
      const { id } = req.params;
      console.log(id);
      const findUser = await User.findById(id).populate([
        "following",
        "followers",
      ]);
      res.json(findUser);
    } catch (err) {
      next(err);
    }
  }

  async getUserByUid(req, res, next) {
    try {
      const { uid } = req.params;
      const findUser = await User.findOne({
        uid,
      });

      res.json(findUser);
    } catch (err) {
      next(err);
    }
  }

  // [GET] Single User URL:[api/user/:id]
  async getUserByToken(req, res, next) {
    try {
      const currentUser = req;
    } catch (err) {
      next(err);
    }
  }

  async register(req, res, next) {
    try {
      const { uid } = req.body;
      const findUser = await User.findOne({ uid });
      if (!findUser) {
        const newUser = await User.create(req.body);
        res.json(newUser);
      } else {
        throw new Error("User is existed");
      }
    } catch (err) {
      next(err);
    }
  }

  // [POST] login, URL:[api/user/login]
  async login(req, res, next) {
    try {
      const { uid } = req.body;
      const findUser = await User.findOne({ uid });
      if (findUser) {
        const token = generateToken(findUser?.uid);
        console.log(token)
        const updateUser = await User.findOneAndUpdate(
          { uid },
          { token },
          { new: true }
        );
        res.json(updateUser);
      }else{
        res.status(404).json("User Not Found")
      }
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      const { uid } = req.params;
      console.log(uid);
      const findUser = await User.findOne({ uid: uid });
      console.log(findUser);
      if (findUser) {
        const delToken = await User.findOneAndUpdate(
          { uid },
          {
            token: "",
          }
        );
        res.json(delToken);
      }
    } catch (err) {
      next(err);
    }
  }

  async follow(req, res, next) {
    try {
      const userId = req.params.id;
      const currentUser = req.user;
      const user = await User.findById(userId);
      // Follower
      if (currentUser._id.toString() === userId) {
        throw new Error("Can't follow yourself");
      } else {
        if (!currentUser.following.includes(user?._id)) {
          await currentUser.updateOne({ $push: { following: userId } });
          await user.updateOne({ $push: { followers: currentUser?._id } });
          res.json("User has been follow");
        } else {
          await currentUser.updateOne({ $pull: { following: userId } });
          await user.updateOne({ $pull: { followers: currentUser?._id } });
          res.json("User has been unfollow");
        }
      }
    } catch (err) {
      next(err);
    }
  }
  // [POST] register user URL:[api/user/register]
  // async register(req, res, next) {
  //   try {
  //     const uid = req.body.uid
  //     const email = req.body.email;
  //     const findUser = await User.findOne({ email: email } || {uid});
  //     if (!findUser) {
  //       const newUser = await User.create(req.body);
  //       res.json(newUser);
  //     } else {
  //       throw new Error("User Already Exist");
  //     }
  //   } catch (err) {
  //     next(err);
  //   }
  // }

  // async handleRefreshToken(req, res, next) {
  //   try {
  //     const cookie = req.cookies;
  //     if (!cookie?.refreshToken) {
  //       throw new Error("No refresh token in Cookie!");
  //     }
  //     const refreshToken = cookie.refreshToken;
  //     const user = await User.findOne({ refreshToken });
  //     if (!user) {
  //       throw new Error("No Refresh token in dB");
  //     }
  //     jwt.verify(refreshToken, process.env.SERCRET_KEY, (err, decoded) => {
  //       if (err || user?.id !== decoded.id) {
  //         throw new Error("There is something wrong with refresh Token");
  //       }
  //       const accesToken = generateToken(user?._id);
  //       res.json({ accesToken });
  //     });
  //   } catch (err) {
  //     next(err);
  //   }
  // }

  // async logOut(req, res, next) {
  //   try {
  //     const cookie = req.cookies;
  //     if (!cookie.refreshToken) {
  //       throw new Error("No refresh token");
  //     }
  //     const refreshToken = cookie?.id;
  //     const user = await User.findOne({ refreshToken });
  //     if (!user) {
  //       res.clearCookie("refreshToken", {
  //         httpOnly: true,
  //         secure: true,
  //       });
  //       return res.sendStatus(204);
  //     }
  //     await User.findByIdAndUpdate(refreshToken, {
  //       refreshToken: "",
  //     });
  //     res.clearCookie("refreshToken", {
  //       httpOnly: true,
  //       secure: true,
  //     });
  //     return res.sendStatus(204);
  //   } catch (err) {
  //     next(err);
  //   }
  // }

  // [POST] login, URL:[api/user/login]
  // async login(req, res, next) {
  //   try {
  //     const { email, passWord,uid } = req.body;
  //     const findUser = await User.findOne({ email } ||{uid});

  //     if (findUser && findUser.isPasswordMatched(passWord)) {
  //       const refreshToken = await generateRefreshToken(findUser?._id);
  //       const updateToken = await User.findByIdAndUpdate(
  //         findUser?._id,
  //         {
  //           refreshToken: refreshToken,
  //         },
  //         {
  //           new: true,
  //         }
  //       );
  //       res.cookie("refreshToken", refreshToken, {
  //         httpOnly: true,
  //         maxAge: 72 * 60 * 60 * 1000,
  //       });
  //       res.json({ ...findUser?._doc, token: generateToken(findUser?._id) });
  //     } else {
  //       throw new Error("Email and Password are incorrect");
  //     }
  //   } catch (err) {
  //     next(err);
  //   }
  // }

  async updateUser(req, res, next) {
    try {
      const user = req.user;
      const { _id } = user;
      const payload = req.body;
      const userUpdate = await User.findByIdAndUpdate(
        _id,
        {
          ...payload,
        },
        {
          new: true,
        }
      );
      res.json(userUpdate);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  async deleteUser(req, res, next) {
    const { id } = req.params;
    try {
      try {
        const deleteUser = await User.deleteOne({ _id: id });
        res.json(deleteUser);
      } catch (err) {
        throw new Error("Cant delete user");
      }
    } catch (err) {
      next(err);
    }
  }

  async savePost(req, res, next) {
    try {
      const { postId } = req.params;
      const user = req.user;

      const findUser = await User.findById(user._id);

      if (findUser.save.includes(postId)) {
        await User.findByIdAndUpdate(
          user._id,
          {
            $pull: {
              save: postId,
            },
          },
          {
            new: true,
          }
        );
        res.json("Remove save");
      } else {
        await User.findByIdAndUpdate(
          user._id,
          {
            $push: {
              save: postId,
            },
          },
          {
            new: true,
          }
        );
        res.json("Saved");
      }
    } catch (err) {
      next(err);
    }
  }
  async getSavedPage(req, res, next) {
    try {
      const { page = 1, limit = 20, sortBy } = req.query;
      const { userId } = req.params;
      const user = req.user;
      const skip = (page - 1) * limit;
      let sort = sortBy || "createdAt";
      const sortOption = {};

      if (sort) {
        sort = sort.split(",");
        if (sort[1]) {
          sortOption["save." + sort[0]] = Number(sort[1]);
        } else {
          sortOption["save." + sort[0]] = 1;
        }
      }
      console.log(sortOption)
      const test = await User.aggregate([
        {
          $match: {
            _id: new ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: "inspirations",
            localField: "save",
            foreignField: "_id",
            as: "save",
          },
        },
   
      

        {
          $unwind: "$save",
        },
        {
          $lookup: {
            from: "users",
            localField: "save.likes",
            foreignField: "_id",
            as: "save.likes",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "save.postedBy",
            foreignField: "_id",
            as: "save.postedBy",
          },
        },
        {
          $unwind: "$save.postedBy",
        },
        {
          $skip: Number(skip),
        },
        {
          $limit: Number(limit),
        },
        {
          $addFields: {
            save: {
              popular: {
                $size: "$save.likes",
              },
            },
          },
        },
        {
          $sort: sortOption,
        },
        // {
        //   $addFields: {
        //     totalLikes: { $size: "$save.likes" },
        //   },
        // },
        // {
        //   $sort: sortOption,
        // },
      ]);
      console.log(test)
      const foo = test.map((item, index) => {
        const temp = item.save;
        return temp;
      });

      // const findUser = await User.findById(user._id, {
      //   _id: 0,
      //   save: { $slice: [skip, Number(limit)] },
      // }).populate({
      //   path: "save",
      //   select: ["-comments"],
      //   populate: {
      //     path: "postedBy",
      //   },
      // });
      res.json(foo);
    } catch (err) {
      next(err);
    }
  }

  async deleteSavedPost(req, res, next) {
    try {
      const { postId } = req.params;
      const user = req.user;

      const findUser = await User.findById(user._id);

      if (findUser.save.includes(postId)) {
        await User.findByIdAndUpdate(
          user._id,
          {
            $pull: {
              save: postId,
            },
          },
          {
            new: true,
          }
        );
        res.json("Removed");
      } else {
        res.json("Not found123");
      }
    } catch (err) {
      next(err);
    }
  }

  async searchUserName(req, res, next) {
    try {
      const { page = 1, limit = 5, key = "" } = req.query;

      const skip = (page - 1) * limit;
      const result = await User.find({
        firstName: { $regex: key, $options: "i" },
      })
        .skip(skip)
        .limit(limit);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
  async sendNotification(req, res, next) {
    try {
      const receiverId = req.params.id;
      const data = req.body;
      const findReceiver = await User.findById(receiverId);
      if (!findReceiver) {
        throw new Error("User Not Found!");
      } else {
        const sendNotification = await User.findByIdAndUpdate(receiverId, {
          $push: { notification: { ...data } },
        });
        res.json(sendNotification);
      }
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
