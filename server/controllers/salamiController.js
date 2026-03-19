const Salami = require("../models/Salami");

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, bkashNumber } = req.body;

    if (!name || !bkashNumber) {
      return res.status(400).json({
        success: false,
        message: "Name and bKash number are required",
      });
    }

    if (bkashNumber.length !== 11) {
      return res.status(400).json({
        success: false,
        message: "bKash number must be 11 digits",
      });
    }

    const existingUser = await Salami.findOne({ bkashNumber });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "This bKash number has already been used",
      });
    }

    const user = await Salami.create({
      name,
      bkashNumber,
      amount: 0,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    console.log("Register error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Spin Salami
const spinSalami = async (req, res) => {
  try {
    const { bkashNumber } = req.body;

    const user = await Salami.findOne({ bkashNumber });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.amount > 0) {
      return res.status(400).json({
        success: false,
        message: "You already spun the wheel",
      });
    }

    const amounts = [
0.01,
0.10,
0.20,
0.29,
0.50,
1,
3,
5,
7,
10,
15,
17,
14,
4,
13,
12,
11,
19,
20
];
    const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];

    user.amount = randomAmount;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Spin successful",
      amount: randomAmount,
    });
  } catch (error) {
    console.log("Spin error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all salami entries
const getAllSalamiEntries = async (req, res) => {
  try {
    const salamiList = await Salami.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: salamiList,
    });
  } catch (error) {
    console.log("Get all salami error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark as paid
const markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedUser = await Salami.findByIdAndUpdate(
      id,
      { status: "paid" },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log("Mark as paid error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
  spinSalami,
  getAllSalamiEntries,
  markAsPaid,
};