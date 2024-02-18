const express = require("express");
const router = express.Router();

const charController = require("../controllers/CharController");

router.get("/survivals",charController.getSurvivals)
router.get("/hunters",charController.getHunters)
router.get("/role",charController.getCharacter)
router.get("/hunters/:id",charController.getHunters)
router.get("/all", charController.getAllChar);
router.get("/:id",charController.charById)

module.exports = router;
