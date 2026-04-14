const User = require("../models/User");

// GET /api/users/search?q=name — find users to start chats with
exports.searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1) {
      return res.status(400).json({ success: false, message: "Search query is required." });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
      _id: { $ne: req.user._id }, // exclude self
    }).select("username email avatar isOnline lastSeen").limit(20);

    res.status(200).json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id — get a user's public profile
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      "username avatar bio isOnline lastSeen createdAt"
    );
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/online — list currently online users
exports.getOnlineUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isOnline: true, _id: { $ne: req.user._id } })
      .select("username avatar isOnline")
      .limit(50);
    res.status(200).json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
};
