const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Response = require('../models/Response');

const TOKEN_EXPIRY = '6h';
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'love-secret';

const loginAdmin = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    const admin = await Admin.findOne({ username: username.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin._id, username: admin.username }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });

    res.json({ token });
  } catch (error) {
    next(error);
  }
};

const getAllResponses = async (req, res, next) => {
  try {
    const responses = await Response.find().sort({ createdAt: -1 });
    res.json({ responses });
  } catch (error) {
    next(error);
  }
};

const deleteResponse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Response.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Response not found' });
    }
    res.json({ message: 'Deleted', id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginAdmin,
  getAllResponses,
  deleteResponse,
};

