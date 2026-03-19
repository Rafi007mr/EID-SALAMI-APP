const express = require("express");
const router = express.Router();

const {
  registerUser,
  spinSalami,
  getAllSalamiEntries,
  markAsPaid,
} = require("../controllers/salamiController");

router.post("/register", registerUser);
router.post("/spin", spinSalami);
router.get("/all", getAllSalamiEntries);
router.put("/paid/:id", markAsPaid);

module.exports = router;