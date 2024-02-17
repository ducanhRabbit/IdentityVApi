const express = require("express");
const router = express.Router();

const userController = require("../controllers/UserController");
const { authenMiddleware } = require("../middlewares/AuthenHandler");

router.post("/follow/:id", authenMiddleware, userController.follow);
router.post("/register", userController.register);
router.post("/login", userController.login);
// router.get("/refresh",userController.handleRefreshToken)
router.post("/logout/:uid", userController.logout);
router.delete(
  "/saved/:postId",
  authenMiddleware,
  userController.deleteSavedPost
);
router.put("/save/:postId", authenMiddleware, userController.savePost);
router.get("/:userId/saved", authenMiddleware, userController.getSavedPage);
router.get("/search", userController.searchUserName);

router.put("/:id", authenMiddleware, userController.updateUser);
router.get("/:uid",authenMiddleware, userController.getUserByUid);
router.get("/info/:id", authenMiddleware, userController.getUserId);
router.post(
  "/:id/notification",
  authenMiddleware,
  userController.sendNotification
);
router.delete("/:id", userController.deleteUser);
router.get("/", userController.getAllUsers);

module.exports = router;
