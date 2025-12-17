const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const Contact = require('../models/Contact');
const authMiddleware = require('../utils/authMiddleware');

const router = express.Router();

// Store SSE clients
const clients = new Map();

// Search users by username or email
router.get('/users/search', authMiddleware, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const users = await User.find({
      _id: { $ne: req.userId },
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    })
    .select('username email avatar online lastSeen')
    .limit(10);

    res.json(users);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add contact
router.post('/contacts/add', authMiddleware, async (req, res) => {
  try {
    const { contactId } = req.body;

    if (!contactId) {
      return res.status(400).json({ error: 'Contact ID is required' });
    }

    if (contactId === req.userId) {
      return res.status(400).json({ error: 'Cannot add yourself as contact' });
    }

    // Check if contact exists
    const contactUser = await User.findById(contactId);
    if (!contactUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already added
    const existingContact = await Contact.findOne({
      user: req.userId,
      contact: contactId
    });

    if (existingContact) {
      return res.status(400).json({ error: 'Contact already added' });
    }

    // Add contact (bidirectional)
    await Contact.create([
      { user: req.userId, contact: contactId },
      { user: contactId, contact: req.userId }
    ]);

    const populatedContact = await User.findById(contactId).select('-password');

    // Notify the contact via SSE
    const contactClient = clients.get(contactId);
    if (contactClient) {
      contactClient.write(`data: ${JSON.stringify({ type: 'contact_added' })}\n\n`);
    }

    res.status(201).json(populatedContact);
  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all contacts
router.get('/contacts', authMiddleware, async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.userId })
      .populate('contact', 'username email avatar online lastSeen')
      .sort({ addedAt: -1 });

    const contactUsers = contacts.map(c => c.contact);
    res.json(contactUsers);
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove contact
router.delete('/contacts/:contactId', authMiddleware, async (req, res) => {
  try {
    const { contactId } = req.params;

    await Contact.deleteMany({
      $or: [
        { user: req.userId, contact: contactId },
        { user: contactId, contact: req.userId }
      ]
    });

    res.json({ message: 'Contact removed successfully' });
  } catch (error) {
    console.error('Remove contact error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send message
router.post('/messages', authMiddleware, async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    if (!content || !receiverId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const message = new Message({
      sender: req.userId,
      receiver: receiverId,
      content
    });

    await message.save();
    await message.populate('sender', 'username avatar');
    await message.populate('receiver', 'username avatar');

    // Notify receiver via SSE
    const receiverClient = clients.get(receiverId);
    if (receiverClient) {
      receiverClient.write(`data: ${JSON.stringify({ type: 'new_message', message })}\n\n`);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get messages between two users
router.get('/messages/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, before } = req.query;

    const query = {
      $or: [
        { sender: req.userId, receiver: userId },
        { sender: userId, receiver: req.userId }
      ]
    };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('sender', 'username avatar')
      .populate('receiver', 'username avatar');

    // Mark messages as read
    await Message.updateMany(
      { sender: userId, receiver: req.userId, read: false },
      { read: true }
    );

    res.json(messages.reverse());
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get unread message count
router.get('/unread', authMiddleware, async (req, res) => {
  try {
    const unreadCounts = await Message.aggregate([
      { $match: { receiver: req.userId, read: false } },
      { $group: { _id: '$sender', count: { $sum: 1 } } }
    ]);

    res.json(unreadCounts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// SSE endpoint for real-time updates
router.get('/stream', authMiddleware, async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  clients.set(req.userId, res);

  await User.findByIdAndUpdate(req.userId, { online: true });

  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

  const heartbeat = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'heartbeat' })}\n\n`);
  }, 30000);

  req.on('close', async () => {
    clearInterval(heartbeat);
    clients.delete(req.userId);
    await User.findByIdAndUpdate(req.userId, { 
      online: false, 
      lastSeen: new Date() 
    });
  });
});

module.exports = router;