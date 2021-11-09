const express = require("express");
const Task = require("../models/task");
const auth = require("../middlewares/auth");
const router = new express.Router();

// To create task
router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(500).send();
  }
});

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=10
// GET /tasks?sortBy=createdAt_desc
router.get("/tasks", auth, async (req, res) => {
  try {
    const match = {};
    const sort = {};

    if (req.query.sortBy) {
      const parts = req.query.sortBy.split("_");
      sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }

    if (req.query.completed) {
      match.completed = req.query.completed === "true";
    }
    // const tasks = await Task.find({ owner: req.user._id });
    await req.user.populate({
      path: "tasks",
      match,
      options: {
        limit: parseInt(req.query.limit) >= 0 ? parseInt(req.query.limit) : 0,
        skip: parseInt(req.query.skip) >= 0 ? parseInt(req.query.skip) : 0,
        sort,
      },
    });
    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send(e);
    console.log(e);
  }
});

// To query a single task
router.get("/tasks/:id", auth, async (req, res) => {
  const _tid = req.params.id;
  try {
    // const task = await Task.findById(_tid);
    const task = await Task.findOne({ _id: _tid, owner: req.user._id });
    if (!task) return res.status(404).send({ message: "No tasks found!" });
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

// To update a task
router.patch("/tasks/:id", auth, async (req, res) => {
  const _tid = req.params.id;
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValidUpdate = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdate) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const task = await Task.findOne({ _id: _tid, owner: req.user._id });
    // const task = await Task.findById(_tid);
    updates.forEach((update) => (task[update] = req.body[update]));
    if (!task) return res.status(404).send({ message: "No tasks found!" });
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

// Delete a task
router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    // const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).send();
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});
module.exports = router;
