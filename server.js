require("dotenv").config();
const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const path = require("path"); // path module zaroori hai

const app = express();

app.use(cors());
app.use(bodyParser.json());

// 1. Static files ko server par access dena
app.use(express.static(__dirname));

/* ================= EMAIL CONFIG ================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* ================= RAZORPAY ================= */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "#",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "#"
});

/* ================= API ROUTES ================= */

// Enroll Form
app.post("/enroll-form", async (req, res) => {
  try {
    const { name, email, course } = req.body;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Enrollment",
      text: `Name: ${name}\nEmail: ${email}\nCourse: ${course}`
    });
    res.send("Success");
  } catch (error) {
    res.status(500).send("Error");
  }
});

// Create Order (Razorpay)
app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "rcpt_" + Date.now()
    });
    res.json(order);
  } catch (err) {
    res.status(500).send(err);
  }
});

/* ================= FRONTEND SERVE FIX ================= */

// Yeh function hamesha index.html hi load karega 
// chahe koi bhi route ho, isse 404 nahi aayega
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
