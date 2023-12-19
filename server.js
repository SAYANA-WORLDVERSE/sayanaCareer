import express from "express";
import nodemailer from "nodemailer";
import bodyParser from "body-parser";
import multer from "multer";
import dotenv from "dotenv";
import cors from "cors";

const app = express();
dotenv.config({ path: './process.env' });
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors());

// Multer storage configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/submit-form", upload.single("file"), (req, res) => {
  const { full_name, mobile, email, position, message } = req.body;

  if (!full_name || !mobile || !email || !position || !message) {
    return res.status(400).json({ error: "Please enter all required fields" });
  }
  const file = req.file;

  if(!file){
    return res.status(404).json({ error: "file is required" });
  }

  const {originalname, buffer}=file;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user:process.env.USER,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: email,
    to: "bandan.pradhan@sayanaworldverse.com",
    subject: "New Form Submission ",
    text: `
      Full Name: ${full_name}
      Phone: ${mobile}
      Email: ${email}
      Designation: ${position}
      Message: ${message}
    `,
    attachments: [
      {
        filename: originalname,
        content: buffer,
      },
    ],
  };

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    console.log("Email sent:", info.response);
    res.status(200).json({ message: "Email sent successfully!" });
  });
});

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
