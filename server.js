require("dotenv").config();
const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Static files (HTML, CSS, JS) serve karne ke liye
app.use(express.static(__dirname));

/* ================= EMAIL TRANSPORTER ================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* ================= RAZORPAY ================= */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "#RAZORPAY_KEY_ID#",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "#RAZORPAY_KEY_SECRET#"
});

/* ================= API ROUTES ================= */

app.post("/enroll-form", async (req, res) => {
  try {
    const { name, email, phone, college, degree, year, course, amount } = req.body;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Course Enrollment - WeIntern",
      text: `New Course Enrollment\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nCourse: ${course}\nFee: ₹${amount}`
    });
    res.send("Enrollment email sent");
  } catch (error) {
    console.error(error);
    res.status(500).send("Enroll failed");
  }
});

app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now()
    });
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).send("Order failed");
  }
});

// Baki ke routes (apply-form, hire-form) bhi aise hi chalenge...

/* ================= FIX FOR NODE v22 ================= */

// Purana wildcard '*' error de raha tha. 
// Naya format: Use "(.*)" instead of "*"
app.get("(.*)", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
