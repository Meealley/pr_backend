const asyncHandler = require("express-async-handler");
const User = require("../Model/UserModel");
const { generateToken } = require("../Config/jwtToken");
const validateMongoDbId = require("../utils/validateMongId");
const { generateRefreshToken } = require("../Config/refreshToken");
const jwt = require("jsonwebtoken");


//POST CREATE NEW USER
const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email });

  if (!findUser) {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } else {
    throw new Error("User already exists");
  }
});

//POST LOGIN A USER
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    //Check if the user already exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404);
      throw new Error("User not found, Kindly create a new account");
    }

    const correctPassword = await user.isPasswordMatched(password);
    if (user && correctPassword) {
      const refreshToken = await generateRefreshToken(user._id);
      const updateUser = await User.findByIdAndUpdate(
        user.id,
        {
          refreshToken: refreshToken,
        },
        { new: true }
      );
      res.cookie("cookie", refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
      });

      res.json({
        _id: user?._id,
        firstname: user?.firstname,
        lastname: user?.lastname,
        email: user?.email,
        mobile: user?.mobile,
        password: user?.password,
        token: generateToken(user._id),
      });
    } else {
      throw new Error("Invalid username or password");
    }
  } catch (error) {
    throw new Error("Couldn't login user: " + error.message);
  }
});

const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  console.log(cookie)
  if (!cookie?.refreshToken)
    throw new Error("No Refresh token available in cookies");

  const refreshToken = cookie.refreshToken;
    console.log(refreshToken);

  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error("User not found");

  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
   
    if (err || user.id !== decoded.id) {
      throw new Error("There is something wrong with refresh token");
    }
    const accessToken = generateToken(user._id);
    console.log(accessToken);
    res.json({ accessToken });
  });
  //   res.json(user);

  // console.log(cookie);
});

//PUT UPDATE USER
const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    const user = await User.findByIdAndUpdate(
      _id,
      {
        firstname: req?.body.firstname,
        lastname: req?.body.lastname,
        email: req?.body.email,
        mobile: req?.body.mobile,
        password: req?.body.password,
      },
      {
        new: true,
      }
    );
    res.json(user);
  } catch (error) {
    throw new Error("Could not update user" + error.message);
  }
});

//PUT BLOCK USER
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const block = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
    res.json(block);
  } catch (error) {
    throw new Error("Could not block user" + error.message);
  }
});

//PUT UNBLOCK USER
const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const unblock = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
    res.json(unblock);
  } catch (error) {
    throw new Error("Could not unblock user" + error.message);
  }
});

//DELETE DELETE USER
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const user = await User.findByIdAndDelete(id);
    res.json({
      status: `Deleted ${id} successfully`,
      message: user,
    });
  } catch (error) {
    throw new Error("Could not delete user" + error.message);
  }
});

//GET GET ALL USERS
const getAllUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.find();
    res.json(user);
  } catch (error) {
    throw new Error("Couldn't find user" + error.message);
  }
});

//GET GET USER BY ID
const getUserByID = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  // validateMongoDbId(id); 
  try {
    const user = await User.findById(_id);
    res.json(user);
  } catch (error) {
    throw new Error("Couldn't find user" + error.message);
  }
},);


const tokenIValid = asyncHandler(async (req, res) => {
  try {
    const token = req.header('Bearer');
    if(!token) return res.json(false);

    const verified = jwt.verify(token, process.env.JWT_SECRET)
    if(!verified) return res.json(false);

    const user = await User.findById(verified.id)
    if(!user) return res.json(false);
  } catch (error) {
    throw new Error("Couldn't find user" + error.message);
  }
});

module.exports = {
  createUser,
  getAllUser,
  updateUser,
  loginUser,
  getUserByID,
  deleteUser,
  blockUser,
  unblockUser,
  tokenIValid
};
