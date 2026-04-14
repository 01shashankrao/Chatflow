const express = require("express");
const router = express.Router();
const { searchUsers, getUserProfile, getOnlineUsers } = require("../controllers/userController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/search", searchUsers);
router.get("/online", getOnlineUsers);
router.get("/:id", getUserProfile);

module.exports = router;
