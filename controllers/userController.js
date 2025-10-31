const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcrypt");

// ✅
exports.register = async (req, res) => {
  try {
    const { email, username, password, confirmPassword, role } = req.body;

    if (!username || !email || !password || !confirmPassword || !role) {
      return res
        .status(400)
        .json({ success: false, error: "Please fill all the fields" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "Password and Confirm Password should be same",
      });
    }

    const emailExists = await User.findOne({ email });
    
    if (emailExists) {
      return res
        .status(400)
        .json({ success: false, error: "Email is already registered, Please log in" });
    }

    const usernameExists = await User.findOne({ username });

    if (usernameExists) {
      return res
        .status(400)
        .json({ success: false, error: "Username already exists" });
    }

    const hashedPasssword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPasssword,
      role,
    });

    return res
      .status(200)
      .json({ success: true, message: "User created successfully" });
  } catch (error) {
    console.log("ERROR WHILE REGISTERING THE NEW USER : ", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

// ✅
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Please fill all the fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, error: "User not found" });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ 
        success: false, 
        error: "Account is temporarily locked due to too many failed login attempts. Please try again later." 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment failed login attempts
      user.failedLoginAttempts += 1;
      
      // Lock account if 3 or more failed attempts
      if (user.failedLoginAttempts >= 3) {
        user.accountLocked = true;
        user.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
        await user.save();
        return res.status(423).json({ 
          success: false, 
          error: "Account locked due to 3 failed login attempts. Please try again after 15 minutes." 
        });
      }
      
      await user.save();
      return res
        .status(400)
        .json({ 
          success: false, 
          error: `Invalid credentials. ${3 - user.failedLoginAttempts} attempts remaining.` 
        });
    }

    // Reset failed login attempts on successful login
    user.failedLoginAttempts = 0;
    user.accountLocked = false;
    user.lockUntil = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // create cookie and send res
    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    return res.cookie("token", token, options).status(200).json({
      success: true,
      message: "User logged in successfully",
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
          createdAt: user.createdAt,
          attemptedQuizzes: user?.attemptedQuizes || [],
        },
      },
    });
  } catch (error) {
    console.log("ERROR WHILE LOGGIN IN THE USER : ", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
