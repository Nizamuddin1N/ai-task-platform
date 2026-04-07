const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const redis = require('../utils/redis');

const router = express.Router();
router.use(auth);

router.post('/', async (req, res) => {
  try {
    const { title, inputText, operation } = req.body;
    if (!title || !inputText || !operation) {
      return res.status(400).json({ error: 'title, inputText, operation required' });
    }
    const task = await Task.create({
      userId: req.userId, title, inputText, operation, status: 'pending',
      logs: [{ message: 'Task created and queued', timestamp: new Date() }]
    });
    await redis.lpush('task_queue', JSON.stringify({ taskId: task._id.toString(), operation, inputText }));
    res.status(201).json({ message: 'Task created', task });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(50);
    res.json({ tasks });
  } catch {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ task });
  } catch {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

module.exports = router;