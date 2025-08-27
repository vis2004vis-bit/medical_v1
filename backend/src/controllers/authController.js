import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export async function signup(req, res) {
  try {
    const { username, email, password } = req.body
    if (!username || !email || !password) return res.status(400).json({ message: 'Missing fields' })
    const existing = await User.findOne({ username })
    if (existing) return res.status(409).json({ message: 'Username already exists' })
    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ username, email, password: hashed })
    const token = jwt.sign({ username: user.username, id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    return res.json({ token, user: { username: user.username, email: user.email } })
  } catch (e) { return res.status(500).json({ message: 'Signup error' }) }
}

export async function login(req, res) {
  try {
    const { identifier, password } = req.body
    if (!identifier || !password) return res.status(400).json({ message: 'Missing credentials' })
    const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' })
    const token = jwt.sign({ username: user.username, id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    return res.json({ token, user: { username: user.username, email: user.email } })
  } catch (e) { return res.status(500).json({ message: 'Login error' }) }
}

