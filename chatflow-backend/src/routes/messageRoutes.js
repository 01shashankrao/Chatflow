const express = require("express");
const router = express.Router();
const { markRead, deleteMessage } = require("../controllers/messageController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.patch("/:id/read", markRead);
router.delete("/:id", deleteMessage);

module.exports = router;
