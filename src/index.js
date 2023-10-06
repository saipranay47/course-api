require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());

const secret = process.env.JWT_SECRET;

//schemas
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
});

const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
});

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  imageLink: String,
  published: Boolean,
});

const User = mongoose.model("User", userSchema);
const Admin = mongoose.model("Admin", adminSchema);
const Course = mongoose.model("Course", courseSchema);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//middleware
const authenticateJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, secret, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      } else {
        req.user = user;
        next();
      }
    });
  } else {
    res.sendStatus(401);
  }
};

app.get("/", (req, res) => {
  res.send("hello world");
});

// Admin routes
app.post("/admin/signup", async (req, res) => {
  const { username, password, email } = req.body;
  const admin = await Admin.findOne({ username });

  if (admin) {
    res.status(403).json({ message: "Admin Already exists" });
  } else {
    const newAdmin = new Admin({
      username: username,
      password: password,
      email: email,
    });
    newAdmin.save();
    const token = jwt.sign({ username, role: "admin" }, secret, {
      expiresIn: "12h",
    });
    res.status(200).json({ message: "Admin created sucessfully", token });
  }
});

app.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;

  const admin = await Admin.findOne({ username, password });

  if (admin) {
    const token = jwt.sign({ username, role: "admin" }, secret, {
      expiresIn: "12h",
    });
    res.status(200).json({ message: "Logged in sucessfully", token });
  } else {
    res.status(403).send({ message: "Invalid username or password" });
  }
});

app.get("/admin/me", authenticateJwt, (req, res) => {
  res.json({ user : req.user});
})

app.post("/admin/courses", authenticateJwt, async (req, res) => {
  const course = new Course(req.body);
  course.save();
  res
    .status(200)
    .json({ message: "course created sucessfully", courseId: course.id });
});

app.put("/admin/courses/:courseId", authenticateJwt, async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.courseId, req.body, {
    new: true,
  });

  if (course) {
    res.json({ message: "Course updated sucessfully" });
  } else {
    res.status(404).json({ message: "course not found" });
  }
});

app.get("/admin/courses", authenticateJwt, async (req, res) => {
  const courses = await Course.find({});
  res.json({ courses });
});

// User routes
app.post("/users/signup", async (req, res) => {
  const { username, password, email } = req.body;
  const user = await User.findOne({ username });
  if (user) {
    res.status(403).json({ message: "User already exists" });
  } else {
    const newUser = new User({
      username: username,
      password: password,
      email: email,
    });
    newUser.save();
    const token = jwt.sign({ username, role: "user" }, secret, {
      expiresIn: "12h",
    });
    res.json({ message: "User created sucessfully", token });
  }
});

app.post("/users/login", (req, res) => {
  const { username, password } = req.body;
  const user = User.findOne({ username: username, password: password });

  if (user) {
    const token = jwt.sign({ username, role: "user" }, secret, {
      expiresIn: "12h",
    });

    res.json({ message: "Logged in sucessfully", token });
  } else {
    res.status(403).json({ message: "Invalid username or password" });
  }
});

app.get("/users/courses", authenticateJwt, async (req, res) => {
  const courses = Course.find({ published: true });
  res.json({ courses });
});

app.post("/users/courses/:courseId", authenticateJwt, async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (course) {
    const user = await User.findOne({ username: req.user.username });
    if (user) {
      user.purchasedCourses.push(course);
      await user.save();
      res.json({ message: "Course parchased sucessfuly" });
    } else {
      res.status(403).json({ message: "User not found" });
    }
  } else {
    res.status(404).json({ message: "Course not found" });
  }
});

app.get("/users/purchasedCourses", authenticateJwt, async (req, res) => {
  const user = await User.findOne({ username: req.user.username }).populate(
    "purchasedCourses"
  );
  if (user) {
    res.json({ purchasedCourses: user.purchasedCourses || [] });
  } else {
    res.status(403).json({ message: "User not found" });
  }
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
