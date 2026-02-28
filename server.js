require("dotenv").config();

const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const path = require("path");   // ✅ upar hi require karo

const app = express();

app.use(cors());
app.use(bodyParser.json());

/* =========================================================
   SERVE FRONTEND FILES  ✅ IMPORTANT
========================================================= */

app.use(express.static(path.join(__dirname)));


/* =========================================================
   ROOT ROUTE  ✅ VERY IMPORTANT
========================================================= */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});


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


/* =========================================================
   ENROLL FORM
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


    await transporter.sendMail({

      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,

      subject: "New Course Enrollment - WeIntern",

      text: `
Name: ${name}
Email: ${email}
Course: ${course}
Fee: ₹${amount}
      `
    });


    await transporter.sendMail({

      from: process.env.EMAIL_USER,
      to: email,

      subject: "Enrollment Received - WeIntern",

      text: `
Hello ${name},

Enrollment received successfully.
      `
    });


    res.send("Enrollment email sent");

  }

  catch (error) {

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

  }

  catch (error) {

    console.log(error);

    res.status(500).send("Order failed");

  }

});


/* =========================================================
   APPLY FORM
========================================================= */

app.post("/apply-form", async (req, res) => {

  try {

    const {
      name,
      email,
      phone,
      college,
      interest,
      year,
      message
    } = req.body;


    await transporter.sendMail({

      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,

      subject: "New Internship Application",

      text: `
Name: ${name}
Email: ${email}
Interest: ${interest}
      `
    });


    res.send("Apply email sent");

  }

  catch (error) {

    console.log(error);

    res.status(500).send("Apply failed");

  }

});


/* =========================================================
   HIRE FORM
========================================================= */

app.post("/hire-form", async (req, res) => {

  try {

    const {
      name,
      company,
      email,
      phone,
      services,
      description,
      budget
    } = req.body;


    await transporter.sendMail({

      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,

      subject: "New Business Inquiry",

      text: `
Name: ${name}
Company: ${company}
Budget: ${budget}
      `
    });


    res.send("Hire email sent");

  }

  catch (error) {

    console.log(error);

    res.status(500).send("Hire failed");

  }

});


/* =========================================================
   START SERVER  ✅ FINAL FIX
========================================================= */

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
