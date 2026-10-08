const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/database');
const { createError } = require('../../middleware/error.middleware');

const register = async ({ fullName, email, password }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw createError(409, 'Email already registered', 'EMAIL_TAKEN');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { fullName, email, passwordHash },
  });

  // Create empty cart
  await prisma.cart.create({ data: { userId: user.id } });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, token };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw createError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw createError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, token };
};

module.exports = { register, login };
