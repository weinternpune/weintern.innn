require("dotenv").config();

const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();

/* ================= MIDDLEWARE ================= */

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


/* =========================================================
   TEST ROUTE (IMPORTANT FOR CHECKING)
========================================================= */

app.get("/api/test", (req, res) => {
  res.send("Backend working ✅");
});


/* =========================================================
   ENROLL FORM EMAIL
========================================================= */

app.post("/enroll-form", async (req, res) => {

  try {

    const {
      name,
      email,
      phone,
      college,
      degree,
      year,
      course,
      amount
    } = req.body;

    // ADMIN EMAIL
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Course Enrollment - WeIntern",
      text:
`New Course Enrollment

Name: ${name}
Email: ${email}
Phone: ${phone}
College: ${college}
Degree: ${degree}
Year: ${year}
Course: ${course}
Fee: ₹${amount}`
    });


    // STUDENT EMAIL
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Enrollment Received - WeIntern",
      text:
`Hello ${name},

Your enrollment for "${course}" has been received.

WeIntern Team`
    });

    res.send("Enrollment email sent");

  } catch (error) {

    console.log(error);
    res.status(500).send("Enroll failed");

  }

});


/* =========================================================
   CREATE ORDER
========================================================= */

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

    console.log(error);
    res.status(500).send("Order failed");

  }

});


/* =========================================================
   APPLY FORM EMAIL
========================================================= */

app.post("/apply-form", async (req, res) => {

  try {

    const { name, email, phone, college } = req.body;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Internship Application",
      text:
`Name: ${name}
Email: ${email}
Phone: ${phone}
College: ${college}`
    });

    res.send("Apply email sent");

  } catch (error) {

    console.log(error);
    res.status(500).send("Apply failed");

  }

});


/* =========================================================
   HIRE FORM EMAIL
========================================================= */

app.post("/hire-form", async (req, res) => {

  try {

    const { name, company, email } = req.body;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Business Inquiry",
      text:
`Name: ${name}
Company: ${company}
Email: ${email}`
    });

    res.send("Hire email sent");

  } catch (error) {

    console.log(error);
    res.status(500).send("Hire failed");

  }

});


/* =========================================================
   STATIC FILE FIX (VERY IMPORTANT)
========================================================= */

const publicPath = path.join(__dirname);

app.use(express.static(publicPath));

/* ROOT FIX */
app.get("/", (req, res) => {

  res.sendFile(path.join(publicPath, "index.html"));

});


/* =========================================================
   START SERVER
========================================================= */

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {

  console.log("Server running on port " + PORT);

});
