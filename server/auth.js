import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { userOperations, analysisOperations } from './database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Hash password
export const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Verify password
export const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Register user
export const registerUser = async (userData) => {
  const { name, email, password, tier = 'standard' } = userData;

  // Check if user already exists
  const existingUser = await userOperations.findByEmail(email);
  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  // Validate tier
  if (!['standard', 'pro'].includes(tier)) {
    throw new Error('Invalid tier specified');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const userId = randomUUID();
  const user = await userOperations.create({
    id: userId,
    email,
    name,
    passwordHash,
    tier
  });

  // Generate token
  const token = generateToken(userId);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      tier: user.tier,
      createdAt: user.createdAt
    },
    token
  };
};

// Login user
export const loginUser = async (credentials) => {
  const { email, password } = credentials;

  // Find user
  const user = await userOperations.findByEmail(email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isValidPassword = await verifyPassword(password, user.password_hash);
  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const token = generateToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      tier: user.tier,
      createdAt: user.created_at
    },
    token
  };
};

// Get user by token
export const getUserByToken = async (token) => {
  const decoded = verifyToken(token);
  const user = await userOperations.findById(decoded.userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    tier: user.tier,
    createdAt: user.created_at
  };
};

// Middleware to authenticate requests
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const user = await getUserByToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Save analysis to history
export const saveAnalysisToHistory = async (userId, analysisData) => {
  const { text, features, result } = analysisData;
  
  const analysis = await analysisOperations.create({
    id: randomUUID(),
    userId,
    text,
    features,
    result
  });

  return analysis;
};

// Get user's analysis history
export const getUserAnalysisHistory = async (userId, limit = 50) => {
  return await analysisOperations.findByUserId(userId, limit);
};