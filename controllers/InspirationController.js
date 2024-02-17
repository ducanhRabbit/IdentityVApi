const { json } = require("express");
const Inspiration = require("../models/Inspiration");
const { param } = require("../routes/inspiration");
const User = require("../models/User");
const Comment = require("../models/Comment");

class InspirationController {
  async getAllInspiration(req, res, next) {
    try {
      const inspirationList = await Inspiration.find().populate("postedBy");
      res.json(inspirationList);
    } catch (err) {
      next(err);
    }
  }

  async searchInspiration(req, res, next) {
    try {
      const { page = 1, limit = 10, key = "" } = req.query;
      const skip = (page - 1) * limit;
      const result = await Inspiration.find({
        plainTitle: { $regex: key, $options: "i" },
      })
        .skip(skip)
        .limit(limit)
        .populate("postedBy")
        .populate("likes");
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getPageInspiration(req, res, next) {
    try {
      const { page, limit, sortBy } = req.query;
      const skip = (page - 1) * limit;
      let sort = sortBy || "createdAt";
      let sortOption = {};
      if (sort) {
        sort = sort.split(",");
        if (sort[1]) {
          sortOption[sort[0]] = Number(sort[1]);
        } else {
          sortOption[sort[0]] = 1;
        }
      }

      const findInspiration = await Inspiration.aggregate([
        {
          $addFields: {
            popular: { $size: "$likes" },
          },
        },
        {
          $sort: sortOption,
        },
        {
          $lookup: {
            from: "users",
            localField: "postedBy",
            foreignField: "_id",
            as: "postedBy",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "likes",
            foreignField: "_id",
            as: "likes",
          },
        },
        {
          $unwind: "$postedBy",
        },
        {
          $skip: Number(skip),
        },
        {
          $limit: Number(limit),
        },
      ]);

      // const response = await Inspiration.find()
      //   .skip(skip)
      //   .limit(limit)
      //   .populate("postedBy");

      res.json(findInspiration);
    } catch (err) {
      next(err);
    }
  }

  async getAllInspirationByUser(req, res, next) {
    try {
      const { page, limit } = req.query;

      const { id } = req.params;
      const skip = (page - 1) * limit;
      const findInspiration = await Inspiration.find({
        postedBy: id,
      })
        .skip(skip)
        .limit(limit)
        .populate("postedBy")
        .populate("likes");

      res.json(findInspiration);
    } catch (err) {
      next(err);
    }
  }

  async getInspirationById(req, res, next) {
    try {
      const { id } = req.params;
      const find = await Inspiration.findById(id);

      if (find) {
        const inspiration = await Inspiration.findById(id).populate([
          { path: "likes" },
          {
            path: "postedBy",
            populate: {
              path: "followers",
            },
          },
          {
            path: "comments",
            populate: {
              path: "postedBy",
            },
          },
          {
            path: "comments.replies",
            populate: [
              {
                path: "receiver",
              },
              {
                path: "postedBy",
              },
            ],
          },
        ]);
        res.json(inspiration);
      } else {
        res.status(404).json("Not found");
      }
    } catch (err) {
      next(err);
    }
  }

  async createInspiration(req, res, next) {
    try {
      const userId = req?.user?._id;
      const newInspiration = await Inspiration.create({
        ...req.body,
        postedBy: userId,
      });

      res.json(newInspiration);
    } catch (err) {
      next(err);
    }
  }

  async updateInspiration(req, res, next) {
    try {
      const { id } = req.params;
      const findInspiration = await Inspiration.findById(id);
      if (findInspiration) {
        const updateInspiration = await Inspiration.findByIdAndUpdate(
          id,
          req.body,
          { new: true }
        );
        res.json(updateInspiration);
      } else {
        throw new Error("Inspiration not found");
      }
    } catch (err) {
      next(err);
    }
  }

  async deleteInspiration(req, res, next) {
    try {
      const { id } = req.params;
      const deleteInspiration = await Inspiration.findByIdAndDelete(id);
      res.json("Deleted");
    } catch (err) {
      next(err);
    }
  }

  async likeInspiration(req, res, next) {
    const { id } = req.params;
    const findInspiration = await Inspiration.findById(id);
    const userId = req?.user._id;
    if (findInspiration.likes.includes(userId)) {
      const inspiration = await Inspiration.findByIdAndUpdate(
        id,
        {
          $pull: { likes: userId },
          countLike: findInspiration.likes.length - 1,
        },
        {
          new: true,
        }
      ).populate(["likes", "postedBy"]);
      res.json(inspiration);
    } else {
      const inspiration = await Inspiration.findByIdAndUpdate(
        id,
        {
          $push: { likes: userId },
          countLike: findInspiration.likes.length + 1,
        },
        {
          new: true,
        }
      ).populate([{ path: "likes" }, { path: "postedBy" }]);
      res.json(inspiration);
    }
  }

  async addComment(req, res, next) {
    try {
      const inspirationID = req.params.id;
      const user = req.user;
      console.log(user);

      const inspiration = await Inspiration.findById(inspirationID);
      if (req.body.comment === null || req.body.comment === "") {
        return res.status(400).json("Comment is required");
      }

      const newComment = {
        comment: req.body.comment,
        postedBy: req.user._id,
      };

      await inspiration.updateOne({ $push: { comments: newComment } });

      res.json("Done");
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  async replyComment(req, res, next) {
    try {
      const { id, commentId } = req.params;
      const currentUser = req.user;
      const newReply = {
        comment: req.body.comment,
        receiver: req.body.receiver,
        postedBy: currentUser,
      };
      if (req.body.comment === null || req.body.comment === "") {
        return res.status(400).json("Comment is required");
      }
      const inspiration = await Inspiration.findOneAndUpdate(
        {
          $and: [
            { _id: id },
            {
              comments: {
                $elemMatch: {
                  _id: commentId,
                },
              },
            },
          ],
        },
        {
          $push: {
            "comments.$.replies": newReply,
          },
        },
        {
          new: true,
        }
      ).populate({
        path: "comments",
        populate: {
          path: "replies",
          populate: {
            path: "postedBy",
          },
        },
        populate: {
          path: "receiver",
        },
      });
      res.json(inspiration.comments);
    } catch (err) {
      next(err);
    }
  }

  async getCommentByPostId(req, res, next) {
    try {
      const { id } = req.params;
      const inspiration = await Inspiration.findById(id).populate([
        {
          path: "comments.replies",
          populate: [
            {
              path: "receiver",
            },
            {
              path: "postedBy",
            },
          ],
        },
        {
          path: "comments",
          populate: {
            path: "postedBy",
          },
        },
      ]);
      res.json(inspiration.comments);
    } catch (err) {
      next(err);
    }
  }

  async editInspiration(req, res, next) {
    try {
      const { id } = req.params;

      const findInspiration = await Inspiration.findById(id);
      if (findInspiration) {
        const res1 = await Inspiration.findByIdAndUpdate(
          id,
          {
            ...req.body,
          },
          {
            new: true,
          }
        );

        res.json(res1);
      } else {
        res.status(404).json("Not found Inspiration");
      }
    } catch (err) {
      next(err);
    }
  }

  async editComment(req, res, next) {
    try {
      const { id, commentId } = req.params;
      const newComment = req.body.comment;
      const inspiration = await Inspiration.findOneAndUpdate(
        {
          comments: {
            $elemMatch: {
              _id: commentId,
            },
          },
        },
        {
          "comments.$.comment": newComment,
        }
      );

      res.json("Done");
    } catch (err) {
      next(err);
    }
  }

  async editReply(req, res, next) {
    try {
      const { id, commentId, replyId } = req.params;
      const newReply = req.body.reply;
      const inspiration = await Inspiration.updateOne(
        {
          _id: id,
        },
        {
          $set: {
            "comments.$[comment].replies.$[reply].comment": newReply,
          },
        },
        {
          arrayFilters: [
            {
              "comment._id": commentId,
            },
            {
              "reply._id": replyId,
            },
          ],
        }
      );

      res.json("Reply Edited!");
    } catch (err) {
      next(err);
    }
  }

  async deleteComment(req, res, next) {
    try {
      const { id, commentId } = req.params;
      const inspiration = await Inspiration.findOneAndUpdate(
        {
          comments: {
            $elemMatch: {
              _id: commentId,
            },
          },
        },
        {
          $pull: {
            comments: {
              _id: commentId,
            },
          },
        }
      );

      res.json("Deleted");
    } catch (err) {
      next(err);
    }
  }
  async deleteReply(req, res, next) {
    try {
      const { id, commentId, replyId } = req.params;

      const findComment = await Inspiration.findOne({
        comments: {
          $elemMatch: {
            _id: commentId,
            replies: {
              $elemMatch: {
                _id: replyId,
              },
            },
          },
        },
      });
      if (!findComment) {
        res.status(404).json("Not found!");
      } else {
        const test1 = await Inspiration.findOneAndUpdate(
          {
            _id: id,
            "comments._id": commentId,
          },
          {
            $pull: {
              "comments.$.replies": { _id: replyId },
            },
          }
        );
        res.json("Done");
      }
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new InspirationController();
