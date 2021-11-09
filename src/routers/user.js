const express = require("express");
const User = require("../models/user");
const auth = require("../middlewares/auth");
const upload = require("../middlewares/multer");
const sharp = require("sharp");
const {
  sendWelcomeEmail,
  sendCalcellationEmail,
} = require("../emails/account");
const router = new express.Router();

// To create user
router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    sendWelcomeEmail(user.name, user.email);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token }); //Her user obj is stringified and sent.
  } catch (e) {
    res.status(400).send(e);
  }
});

// To login user
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    // 'user' for generating tokens for every individual users
    const token = await user.generateAuthToken();
    res.send({ user, token }); //Her user obj is stringified and sent.
  } catch (e) {
    res.status(400).send({ error: "Invalid credentials" });
  }
});

// To logout user
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send({ message: "Logged out successfully" });
  } catch (e) {
    res.status(500).send();
  }
});

// To loguot all
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send({ message: "Logged out successfully from all the devices!" });
  } catch (e) {
    res.status(500).send();
  }
});

// To query single profile
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

// Upload avatar
router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const imageBuffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = imageBuffer;
    await req.user.save();
    res.send("Uploaded successfully!");
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

// Delete avatar
router.delete(
  "/users/me/avatar",
  auth,
  async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send("Avatar deleted successfully.");
  },
  (error, req, res, next) => {
    res.status(500).send({ error: error.message });
  }
);

// To get the avatar
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set("Content-Type", "image/jpg");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

// To update a user
router.patch("/users/me", auth, async (req, res) => {
  const _uid = req.user._id;
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "age", "password"];
  const isValidUpdate = updates.every((update) => {
    return allowedUpdates.includes(update);
  });

  if (!isValidUpdate) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    // const user = await User.findByIdAndUpdate(_uid, req.body, {
    //   new: true,
    //   runValidators: true,
    // });
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

// Delete a single user
router.delete("/users/me", auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id);
    // if (!user) {
    //   return res.status(404).send();
    // }
    await req.user.remove();
    sendCalcellationEmail(req.user.name, req.user.email);
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
