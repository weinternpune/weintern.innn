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
  key_id: process.env.RAZORPAY_KEY_ID || "dummy",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy"
});


/* ================= ROUTES ================= */

app.post("/enroll-form", async (req, res) => {
  try {

    const { name, email, phone, college, degree, year, course, amount } = req.body;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Course Enrollment",
      text: `
Name: ${name}
Email: ${email}
Phone: ${phone}
College: ${college}
Course: ${course}
Amount: ${amount}
      `
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Enrollment Received",
      text: `Hello ${name}, your enrollment received.`
    });

    res.send("Enrollment email sent");

  } catch (e) {
    console.log(e);
    res.status(500).send("Error");
  }
});


app.post("/apply-form", async (req, res) => {

  try {

    const { name, email, phone, college } = req.body;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Application",
      text: `
Name: ${name}
Email: ${email}
Phone: ${phone}
College: ${college}
      `
    });

    res.send("Application sent");

  } catch (e) {

    console.log(e);
    res.status(500).send("Error");

  }

});


/* ================= STATIC FILE FIX ================= */

const publicPath = path.join(__dirname);

app.use(express.static(publicPath));

/* ROOT */
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

/* CATCH-ALL FIX (EXPRESS 5 SAFE) */
app.use((req, res) => {
  res.status(404).sendFile(path.join(publicPath, "index.html"));
});


/* ================= START SERVER ================= */

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
