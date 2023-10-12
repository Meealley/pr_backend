const express = require("express");
const {
  getAllUser,
  createUser,
  updateUser,
  loginUser,
  getUserByID,
  deleteUser,
  blockUser,
  unblockUser,
} = require("../Controller/UserController");
const { authMiddleware, isAdmin } = require("../Middleware/AuthMiddleware");
const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.get("/", getAllUser);
router.get("/:id", authMiddleware,isAdmin, getUserByID);
router.put("/update-user", authMiddleware, updateUser);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser);
router.delete("/:id", deleteUser);

module.exports = router;
