// routes/taskRoutes.js

const express = require('express');
const Task = require('../models/Task'); // Adjust the path as necessary
const Wishlist = require('../models/Wishlist'); // Adjust the path as necessary
const router = express.Router();

// API route to add a new task
router.post('/', async (req, res) => {
  const { name, points, link } = req.body;

  // Validate the task data
  if (!name || !points || !link) {
    return res.status(400).json({ error: 'Task name, points, and link are required' });
  }

  try {
    // Create a new task
    const newTask = new Task({ name, points, link });
    await newTask.save();

    return res.status(201).json({ message: 'Task added successfully!', task: newTask });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// API route to retrieve all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find();
    return res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// API route to complete a task
router.post('/complete', async (req, res) => {
  const { email, taskId } = req.body;

  // Validate the request
  if (!email || !taskId) {
    return res.status(400).json({ error: 'Email and task ID are required' });
  }

  try {
    // Find the user by email
    const user = await Wishlist.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if the user has already completed the task
    if (user.completedTasks && user.completedTasks.includes(taskId)) {
      return res.status(400).json({ message: 'Task already completed' });
    }

    // Update user's points and completed tasks
    user.points += task.points;
    user.completedTasks = user.completedTasks || [];
    user.completedTasks.push(taskId);
    await user.save();

    return res.status(200).json({ message: 'Task completed successfully!', totalPoints: user.points });
  } catch (error) {
    console.error('Error completing task:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// API route to update a task
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, points, link } = req.body;

  // Validate the request
  if (!name || !points || !link) {
    return res.status(400).json({ error: 'Task name, points, and link are required' });
  }

  try {
    const updatedTask = await Task.findByIdAndUpdate(id, { name, points, link }, { new: true });
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.status(200).json({ message: 'Task updated successfully!', task: updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// API route to delete a task
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.status(200).json({ message: 'Task deleted successfully!' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/completed-tasks', async (req, res) => {
    const { email } = req.body;
  
    // Validate the request
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
  
    try {
      // Find the user by email
      const user = await Wishlist.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Get completed task IDs from the user
      const completedTaskIds = user.completedTasks || [];
  
      // Fetch the completed tasks from the Task collection
      const completedTasks = await Task.find({ _id: { $in: completedTaskIds } });
  
      return res.status(200).json(completedTasks);
    } catch (error) {
      console.error('Error fetching completed tasks:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  });
module.exports = router;
