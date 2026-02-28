require("dotenv").config();
const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// 1. Static files serve karein (CSS, JS, Images)
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

app.post("/enroll-form", async (req, res) => {
  try {
    const { name, email, phone, course, amount } = req.body;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Enrollment",
      text: `Name: ${name}\nEmail: ${email}\nCourse: ${course}`
    });
    res.status(200).send("Success");
  } catch (error) {
    res.status(500).send("Error");
  }
});

// Create Razorpay Order
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

/* ================= THE FIX FOR PATH ERROR ================= */

// Node v22 compatibility ke liye wildcard (*) ya (.*) hata kar 
// seedha middleware function use kar rahe hain jo index.html serve karega.
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.includes('.')) {
    res.sendFile(path.join(__dirname, "index.html"));
  } else {
    next();
  }
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
