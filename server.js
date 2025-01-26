const express = require("express");
const app = express();
const path = require("path");
const nodemailer = require("nodemailer");
const redis = require("redis");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const user = require("./model/usermodell.js");
const { log } = require("console");
const bcrypt = require("bcrypt");
const redisClient = redis.createClient();
// Connect to Redis 
redisClient
  .connect()
  .then(() => {
    console.log("Connected to Redis");
  })
  .catch(console.log("error in redis"));
//connect to mongodb
let uri =
"mongodb+srv://faizanmir474:jgRapeKNXEFxIGdt@cluster0.qiesl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
 
mongoose
  .connect(uri)
  .then(() => console.log("connected to mongodb atlas"))
  .catch((err) => console.log("Failed to connect to mongoDB atlas", err));

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
//for ejs
app.set('view engine', 'ejs');
app.set("views", __dirname + "/views");

// Route to serve the homepage

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/create-new-account", (req, res) => {
  res.sendFile(__dirname + "/public/createnewacc.html");
});

//when user will click submit he will be served otp page
app.get("/new-acc-submit", (req, res) => {
  res.sendFile(__dirname + "/public/otp.html");
});
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});
const jwtsecret = "mySecrEt";
//route is a post route when one clicks submit from createnew account form fetch req is made
app.post("/datacreateacc", (req, res) => {
  const token = jwt.sign(req.body.email, jwtsecret);
  res.status(200).cookie("jwt", token).json({
    status: true,
    message: "data received And OTP Send At Email",
    email: req.body.email,
  });

  GenerateOtpAndSend(req.body);
});

app.post("/verifyotp", (req, res) => {
  console.log(req.body.otp);
  const emailascookie = req.cookies.jwt;
  let verifyemail;
  try {
    //decoding email this will contain the decoded email
    verifyemail = jwt.verify(emailascookie, jwtsecret);
    console.log("Decoded JWT payload (email):", verifyemail);
  } catch (err) {
    console.log("error in verifying jwt");
  }
  //function to fetch otp using email and data saving
  let fetchotpRedis = async () => {
    const fetchobjRedis = await redisClient.get(verifyemail);
    console.log("fucking object in string ", fetchobjRedis);
    let parsedobject = JSON.parse(fetchobjRedis);
    const fetchotpRedis = parsedobject.otp;
    console.log(`otp fetched from redis${fetchotpRedis}`);

    return fetchotpRedis;
  };

  (async () => {
    if (req.body.otp == (await fetchotpRedis())) {
//date
let date=new Date();

      //***********************************data to be saved in db*********************************************************************
      const fetchobjRedis = await redisClient.get(verifyemail);
      let parsedobject = JSON.parse(fetchobjRedis);

      let hashedPassword = await hashPass(parsedobject.password);

      let newUser = new user({
        userName: parsedobject.username,
        email: parsedobject.email,
        city: parsedobject.city,
        mobileNo: parsedobject.mobileno,
        password: hashedPassword,
        joindate:date,
        walletBalance:0,
      });

      await newUser.save().then(() => {
        log("data saved");
      });
      // .catch(() => {
      //   log("shayad email already exists")
      //if this  uncommented it shows account created even if not
      // });

      redisClient.del(verifyemail);

      res.json({
        status: true,
        redirectUrl: "/loginaftercreateacc",
      });
    } else {
      res.json({
        status: false,
        message: "OTP didn't match",
      });
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

async function GenerateOtpAndSend(req) {
  const otp = Math.floor(100000 + Math.random() * 900000);
  //set full user details in redis
  let email = req.email;
  let username = req.username;
  let city = req.city;
  let mobileno = req.mobileno;
  let password = req.pass;
  let Otp = otp;

  let userobj = {
    email: email,
    username: username,
    city: city,
    mobileno: mobileno,
    password: password,
    otp: Otp,
  };

  await redisClient.set(email, JSON.stringify(userobj));

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

//**password hashing */
async function hashPass(pass) {
  let hashedPassword = await bcrypt.hash(pass, 10);
  return hashedPassword;
}

/*/***********password hasing till here// */
//working with login from here
app.post("/logindata", async (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  let userData = await user.findOne({ email });
  console.log(userData);

  // sameer =>if user not found send 400 and error message is handled on front end
  if (!userData) {
    res.json({
      status: 400,
      message: "accountt not found",
    });
  } else if (userData != null) {
    //bhai sameer yaha par agar ponch gaye toh mtlb email is found now check is pass matching
    //it will hold true or false acc to match

    let decodepass = await comparepasswithdb(password, userData.password);

    if (decodepass) {
      let id = userData._id;
      let anothersecret = "thisis";
      let token = jwt.sign({ id }, anothersecret);
      res
        .clearCookie("loginid")
        .cookie("loginid", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        })
        .json({
          message: "jwt sent",
          status: 200,
        });
      console.log("here here");
    }

    //if password dosent match
    if (!decodepass) {
      res.json({
        message: "pass dosent match",
        status: 400,
      });
    }
  }
});

//function to compare given pass and db pass

async function comparepasswithdb(givenpass, dbpass) {
  const decodepass = await bcrypt.compare(givenpass, dbpass);
  console.log("decodedpass", decodepass);
  return decodepass;
}

//******************************************************personal account route************************************************ */ */
app.get("/userpaccopage", async(req, res) => {
//converting jtw obj id to obj id
let secret ="thisis";
let convertedidobj=jwt.verify(req.cookies.loginid,secret);
let uid=convertedidobj.id


//finding and getting userdetails
let userDetails=await user.findById(uid)
log("f",userDetails)
let userde={

username:userDetails.userName,
date:userDetails.joindate,
walletBalance:userDetails.walletBalance
 

}

log("user ",userde)
//bcz to control backbutton arrow after logout as browser was setting cache of the userpage even cookie was cleared
res.setHeader('Cache-Control', 'no-store');
  res.render("personal",{userdetail:userde})
 
});   
 /***************************************************************/
  //*****////
 
 //******/

  
 //logout route 

 app.get("/logout",(req,res)=>{

res.clearCookie("loginid",{path:"/"}).redirect("/login")


 }) 
 