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

/* EMAIL */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* TEST ROUTE */
app.get("/api/test", (req,res)=>{
  res.send("Backend working");
});

/* STATIC FILES */
const publicPath = path.join(__dirname);

app.use(express.static(publicPath));

app.get("/", (req,res)=>{
  res.sendFile(path.join(publicPath,"index.html"));
});

/* SAFE FALLBACK */
app.use((req,res)=>{
  res.status(404).sendFile(path.join(publicPath,"index.html"));
});

/* START */
const PORT = process.env.PORT || 8080;

app.listen(PORT, ()=>{
  console.log("Server running on port " + PORT);
});
