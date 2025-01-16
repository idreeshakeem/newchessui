const express = require("express");
const app = express();
const path = require("path");
const nodemailer = require("nodemailer");
const redis = require("redis");
const jwt = require("jsonwebtoken");

const cookieParser = require("cookie-parser");
const { log } = require("console");
const redisurl=redis://red-cu4eu4l6l47c73b2esig:6379
const redisClient = redis.createClient({url:redisurl);
// Connect to Redis
redisClient
  .connect()
  .then(() => {
    console.log("Connected to Redis");
  })
  .catch(console.log("error in redis"));

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Middleware to serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));
//middlware to parse json
app.use(express.json());
//middleware for cookie
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Route to serve the homepage

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/create-new-account", (req, res) => {
  
  res.sendFile(path.join(__dirname, "public", "createnewacc.html"));
});
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});
app.get("/new-acc-submit", (req, res) => {
  res.sendFile(__dirname + "/public/otp.html");
});
const jwtsecret = "mySecrEt";
app.post("/datacreateacc", (req, res) => {
  const token = jwt.sign(req.body.email, jwtsecret);
  res.status(200).cookie("jwt", token).json({
    status: true,
    message: "data received And OTP Send At Email",
    email: req.body.email,
  });

  GenerateOtpAndSend(req.body.email);
});

app.post("/verifyotp", (req, res) => {
  console.log(req.body.otp);
  const emailascookie = req.cookies.jwt;
  let verifyemail;
  try {
    verifyemail = jwt.verify(emailascookie, jwtsecret);
    console.log("Decoded JWT payload (email):", verifyemail);
  } catch (err) {
    console.log("error in verifying jwt");
  }
  let fetchotpRedis = async () => {
    const fetchotpRedis = await redisClient.get(verifyemail);
    console.log(`otp fetched from redis${fetchotpRedis}`);

    return fetchotpRedis;
  };

  (async () => {
    if (req.body.otp == (await fetchotpRedis())) {
      //***********************************bhai sameer data save kar lai db mai*********************************************************************
      console.log("yaha ponch gaya");

      res.json({
        status:true,
         redirectUrl: "/loginaftercreateacc"
      })
    } else {
      res.json({
        status:false,
        message: "OTP didn't match"
      })
    }
  })();
});
//Add routes to handle the new pages
app.get("/loginaftercreateacc", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "loginaftercreateacc.html"));
});
app.get("/otpvftext", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "otpvftext.html"));
});
//OTP SENDING THROUGH EMAIL

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: "chessify2501@gmail.com",
    pass: "mocyujbkaeusolla",
  },
  tls: {
    rejectUnauthorized: true,
  },
});

async function GenerateOtpAndSend(email) {
  const otp = Math.floor(100000 + Math.random() * 900000);
  //set otp in redis
  await redisClient.set(email, otp);

  const mailOtp = {
    from: "chessify2501@gmail.com",
    to: `${email}`,
    subject: "Your Otp For CHESSIFY ",
    text: `Your Otp For Chessify is ${otp}          
DO NOT SHARE THIS OTP WITH ANYONE`,
  };
  await transport.sendMail(mailOtp);
  console.log(`OTP sent to ${email}: ${otp}`);
}
