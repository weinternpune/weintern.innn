require("dotenv").config();

const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

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

/* ================= RAZORPAY (FUTURE USE) ================= */

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "#RAZORPAY_KEY_ID#",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "#RAZORPAY_KEY_SECRET#"
});


/* =========================================================
   ENROLL FORM EMAIL (WITHOUT PAYMENT – DEMO MODE)
========================================================= */

app.post("/enroll-form", async (req, res) => {

  console.log("Enroll form:", req.body);

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

      text: `
New Course Enrollment

Name: ${name}
Email: ${email}
Phone: ${phone}
College: ${college}
Degree: ${degree}
Year: ${year}

Course: ${course}
Fee: ₹${amount}
      `
    });


    // STUDENT EMAIL
    await transporter.sendMail({

      from: process.env.EMAIL_USER,

      to: email,

      subject: "Enrollment Received - WeIntern",

      text: `
Hello ${name},

Your enrollment for "${course}" has been received.

Our team will contact you soon for payment and onboarding.

Thank you 🚀
WeIntern Team
      `
    });


    res.send("Enrollment email sent");


  } catch (error) {

    console.log(error);

    res.status(500).send("Enroll failed");

  }

});


/* =========================================================
   CREATE ORDER (WHEN RAZORPAY LIVE)
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
   PAYMENT CONFIRMATION EMAIL
========================================================= */

app.post("/send-confirmation", async (req, res) => {

  try {

    const {
      name,
      email,
      phone,
      college,
      degree,
      year,
      course,
      amount,
      paymentId
    } = req.body;


    await transporter.sendMail({

      from: process.env.EMAIL_USER,

      to: process.env.EMAIL_USER,

      subject: "New Paid Enrollment - WeIntern",

      text: `
Paid Enrollment

Name: ${name}
Email: ${email}
Phone: ${phone}

Course: ${course}
Amount: ₹${amount}

Payment ID:
${paymentId}
      `
    });


    await transporter.sendMail({

      from: process.env.EMAIL_USER,

      to: email,

      subject: "Payment Successful - WeIntern",

      text: `
Hello ${name},

Payment successful.

Course: ${course}
Amount: ₹${amount}

Payment ID:
${paymentId}

Thank you 🚀
      `
    });


    res.send("Payment email sent");

  }

  catch (error) {

    console.log(error);

    res.status(500).send("Payment email failed");

  }

});


/* =========================================================
   APPLY FORM EMAIL
========================================================= */

app.post("/apply-form", async (req, res) => {

  console.log("Apply form:", req.body);

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
Internship Application

Name: ${name}
Email: ${email}
Phone: ${phone}

College: ${college}
Interest: ${interest}
Year: ${year}

Message:
${message}
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
   HIRE FORM EMAIL
========================================================= */

app.post("/hire-form", async (req, res) => {

  console.log("Hire form:", req.body);

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
Business Inquiry

Name: ${name}
Company: ${company}
Email: ${email}
Phone: ${phone}

Services:
${services}

Description:
${description}

Budget:
${budget}
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
   START SERVER
========================================================= */

const path = require("path");

const PORT = process.env.PORT || 8080;

// serve frontend files
app.use(express.static(__dirname));

// IMPORTANT: root route handle karo
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
