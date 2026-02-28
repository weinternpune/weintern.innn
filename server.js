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

/* ================= EMAIL ================= */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* ================= TEST ROUTE ================= */

app.get("/api/test", (req, res) => {
  res.send("Backend working ✅");
});

/* ================= ENROLL ================= */

app.post("/enroll-form", async (req, res) => {
  try {

    const { name, email, course, amount } = req.body;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Enrollment",
      text: `${name} enrolled in ${course}`
    });

    res.send("OK");

  } catch (e) {
    console.log(e);
    res.status(500).send("Error");
  }
});

/* ================= STATIC FILE ================= */

const publicPath = __dirname;

app.use(express.static(publicPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

/* ================= START ================= */

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
