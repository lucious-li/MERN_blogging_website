import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import cors from "cors";
import admin from "firebase-admin";
import serviceAccountKey from "./mern-blog-website-b2604-firebase-adminsdk-28pf8-8442ddc4ea.json" assert { type: "json" };
import aws from "aws-sdk";

import { getAuth } from "firebase-admin/auth";
//schema below
import User from "./Schema/User.js";
import Blog from "./Schema/Blog.js";

const server = express();
let PORT = 3000;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

server.use(express.json());
server.use(cors());

mongoose.connect(process.env.DB_LOCATION, {
  autoIndex: true,
});

//setting up s3 bucket
const s3 = new aws.S3({
  region: "ap-southeast-2",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const generateUploadURL = async () => {
  const data = new Date();
  const imageName = `${nanoid()}-${data.getTime()}.jpeg`;

  return await s3.getSignedUrlPromise("putObject", {
    Bucket: "mern-blog-web",
    Key: imageName,
    Expires: 1000,
    ContentType: "image/jpeg",
  });
};

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res.status(401).json({ error: "No access Token" });
  }

  jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Access token is invalid" });
    }
    req.user = user.id;
    next();
  });
};
const formatDatattoSend = (user) => {
  const access_token = jwt.sign(
    { id: user._id },
    process.env.SECRET_ACCESS_KEY
  );
  return {
    access_token,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
  };
};

const generateUsername = async (email) => {
  let username = email.split("@")[0];
  let usernameExists = await User.exists({
    "personal_info.username": username,
  });
  usernameExists ? (username += nanoid().substring(0, 5)) : "";
  return username;
};

//upload image url
server.get("/get-upload-url", (req, res) => {
  generateUploadURL()
    .then((url) => {
      res.status(200).json({ uploadURL: url });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

server.post("/signup", (req, res) => {
  let { fullname, email, password } = req.body;
  //validating the data from frontend
  if (fullname.length < 3) {
    return res
      .status(403)
      .json({ error: "Fullname must be at least 3 letters long" });
  }
  if (!email.length) {
    return res.status(403).json({ error: "enter email" });
  }
  if (!emailRegex.test(email)) {
    return res.status(403).json({ error: "email is invalid" });
  }
  if (!passwordRegex.test(password)) {
    return res.status(403).json({
      error:
        "password should to be 6 to 20 characters long with numeric, 1 lowercase and 1 uppercase letters",
    });
  }
  bcrypt.hash(password, 10, async (err, hashed_password) => {
    let username = await generateUsername(email);
    let user = new User({
      personal_info: { fullname, email, password: hashed_password, username },
    });

    user
      .save()
      .then((u) => {
        return res.status(200).json(formatDatattoSend(u));
      })

      .catch((err) => {
        if (err.code == 11000) {
          return res.status(500).json({ error: "Email already exist" });
        }
        return res.status(500).json({
          error: err.message,
        });
      });
  });
});

server.post("/signin", (req, res) => {
  let { email, password } = req.body;
  User.findOne({ "personal_info.email": email })
    .then((user) => {
      if (!user) {
        return res.status(403).json({ error: "Email not found" });
      }

      if (!user.google_auth) {
        bcrypt.compare(password, user.personal_info.password, (err, result) => {
          if (err) {
            return res
              .status(403)
              .json({ error: "Error occured while login please try again" });
          }
          if (!result) {
            return res.status(403).json({ error: "incorrect password" });
          } else {
            return res.status(200).json(formatDatattoSend(user));
          }
        });
      } else {
        return res.status(403).json({
          error: "Account was created using google. Try logging in with google",
        });
      }
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: "err.message" });
    });
});

server.post("/google-auth", async (req, res) => {
  let { access_token } = req.body;
  // console.log(access_token);
  getAuth()
    .verifyIdToken(access_token)
    .then(async (decodedUser) => {
      // console.log(decodedUser);
      let { email, name, picture } = decodedUser;
      picture = picture.replace("s96-c", "s384-c");
      let user = await User.findOne({ "personal_info.email": email })
        .select(
          "personal_info.fullname personal_info.username personal_info.profile_img google_auth"
        )
        .then((u) => {
          // console.log(u);
          return u || null;
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).json({ error: err.message });
        });
      if (user) {
        //login
        if (!user.google_auth) {
          return res.status(403).json({
            error:
              "This email was signed without google.Please log in with password to access the account",
          });
        }
      } else {
        //signup
        let username = await generateUsername(email);
        user = new User({
          personal_info: {
            fullname: name,
            email,
            username,
          },
          google_auth: true,
        });

        await user
          .save()
          .then((u) => {
            user = u;
          })
          .catch((err) => {
            return res.status(500).json({ error: err.message });
          });
      }

      return res.status(200).json(formatDatattoSend(user));
    })
    .catch((err) => {
      return res.status(500).json({
        error:
          "Failed to authenticate you with google. Try with other google account",
      });
    });
});

server.post("/create-blog", verifyJWT, (req, res) => {
  let authorId = req.user;
  let { title, description, banner, tags, content, draft } = req.body;

  if (!title.length) {
    return res.status(403).json({ error: "you need provide a title " });
  }

  if (!draft) {
    if (!description.length || description.length > 300) {
      return res
        .status(403)
        .json({ error: "you need a blog description under 300 words" });
    }
    if (!banner.length) {
      return res.status(403).json({ error: "you need a banner " });
    }
    if (!content.blocks.length) {
      return res.status(403).json({ error: "Need some content to publish it" });
    }

    if (!tags.length || tags.length > 10) {
      return res
        .status(403)
        .json({ error: "Provide tags in order to publish (max:10)" });
    }
  }

  tags = tags.map((tag) => tag.toLowerCase());

  let blog_id =
    title
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/\s+/g, "-")
      .trim() + nanoid();

  let blog = new Blog({
    title,
    description,
    banner,
    content,
    tags,
    author: authorId,
    blog_id,
    draft: Boolean(draft),
  });
  blog.save().then((blog) => {
    let incrementVal = draft ? 0 : 1;
    User.findOneAndUpdate(
      {
        _id: authorId,
      },
      {
        $inc: { "account_info.total_posts": incrementVal },
        $push: { blogs: blog._id },
      }
    )
      .then((user) => {
        return res.status(200).json({ id: blog.blog_id });
      })
      .catch((err) => {
        return res
          .status(500)
          .json({ error: "failed to update total posts number" });
      })
      .catch((err) => {
        return res.status(500).json({ error: err.message });
      });
  });
});
server.listen(PORT, () => {
  console.log("listening on port ->" + PORT);
});
