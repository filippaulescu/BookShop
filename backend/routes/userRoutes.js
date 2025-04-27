import express from 'express';
import User from '../models/userModel.js';
const userRouter = express.Router();
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils.js';
import expressAsyncHandler from 'express-async-handler';

userRouter.post(
  '/signin',
  expressAsyncHandler(async (req, res) => {
    // 1. Input validation
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({
        message: 'Email și parolă sunt obligatorii',
      });
    }

    try {
      // 2. Find user with logging
      console.log('Attempting login for:', req.body.email);
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        console.log('User not found:', req.body.email);
        return res.status(401).json({
          message: 'Email sau parolă incorectă',
        });
      }

      // 3. Password comparison
      const isPasswordValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!isPasswordValid) {
        console.log('Invalid password for:', req.body.email);
        return res.status(401).json({
          message: 'Email sau parolă incorectă',
        });
      }

      // 4. Successful login
      console.log('Successful login for:', user.email);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user),
      });
    } catch (error) {
      // 5. Error handling
      console.error('Login error:', error);
      res.status(500).json({
        message: 'Eroare server la autentificare',
      });
    }
  })
);

// Handle OPTIONS requests for CORS pre-flight
userRouter.options('/signin', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});

userRouter.post(
  '/signup',
  expressAsyncHandler(async (req, res) => {
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
    });
    const user = await newUser.save();
    res.send({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user),
    });
  })
);

export default userRouter;
