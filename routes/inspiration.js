const express = require("express");
const router = express.Router();

const inspirationController = require("../controllers/InspirationController");
const { authenMiddleware } = require("../middlewares/AuthenHandler");

router.post("/create",authenMiddleware,inspirationController.createInspiration)
router.put("/:id/likes",authenMiddleware,inspirationController.likeInspiration)
router.put("/:id/reply/:commentId",authenMiddleware,inspirationController.replyComment)
router.put("/:id/comment/add",authenMiddleware,inspirationController.addComment)
router.post("/:id/comment/edit/:commentId",inspirationController.editComment)
router.post("/:id/comment/edit/:commentId/:replyId",inspirationController.editReply)
router.delete("/:id/comment/del/:commentId",inspirationController.deleteComment)
router.delete("/:id/reply/del/:commentId/:replyId",inspirationController.deleteReply)
router.delete("/:id",inspirationController.deleteInspiration)
router.get("/:id/comment",inspirationController.getCommentByPostId)
router.get("/user/:id",authenMiddleware,inspirationController.getAllInspirationByUser)
router.post("/edit/:id",authenMiddleware,inspirationController.editInspiration)
router.get("/all",inspirationController.getAllInspiration)
router.get("/search", inspirationController.searchInspiration);
router.get("/:id",inspirationController.getInspirationById)
router.get("/", inspirationController.getPageInspiration);

module.exports = router;
