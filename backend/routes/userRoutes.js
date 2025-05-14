import express from 'express';
import User from '../models/userModel.js';
const userRouter = express.Router();
import bcrypt from 'bcryptjs';
import { generateToken, isAuth } from '../utils.js';
import expressAsyncHandler from 'express-async-handler';

userRouter.post(
  '/signin',
  expressAsyncHandler(async (req, res) => {
    // Logging detaliat pentru debugging
    console.log('=== SIGNIN REQUEST ===');
    console.log('Request body email:', req.body.email);
    console.log('Request body password:', req.body.password);
    console.log('Request body keys:', Object.keys(req.body));

    // 1. Input validation
    if (!req.body.email || !req.body.password) {
      console.log('Missing email or password in request');
      return res.status(400).json({
        message: 'Email și parolă sunt obligatorii',
      });
    }

    try {
      // 2. Find user with logging
      console.log('Searching for user with email:', req.body.email);
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        console.log('NO USER FOUND with email:', req.body.email);

        // Verifică câți utilizatori sunt în total în baza de date
        const totalUsers = await User.countDocuments();
        console.log('Total users in database:', totalUsers);

        // Afișează primii 5 utilizatori din baza de date
        const allUsers = await User.find().limit(5);
        console.log(
          'Sample users in db:',
          allUsers.map((u) => ({ email: u.email, isAdmin: u.isAdmin }))
        );

        return res.status(401).json({
          message: 'Email sau parolă incorectă',
        });
      }

      console.log('USER FOUND:', {
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        hasPassword: !!user.password,
      });

      // 3. Password comparison cu debugging
      console.log('Input password:', req.body.password);
      console.log('Stored password hash:', user.password);
      console.log('Stored password hash length:', user.password?.length);

      // Test crypto manual
      console.log('bcrypt is available:', !!bcrypt);
      console.log(
        'bcrypt.compareSync is a function:',
        typeof bcrypt.compareSync === 'function'
      );

      const isPasswordValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      console.log('Password comparison result:', isPasswordValid);

      if (!isPasswordValid) {
        console.log('PASSWORD INVALID for:', req.body.email);

        // Test manual hash
        const testHash = bcrypt.hashSync(req.body.password, 8);
        console.log('Test hash of input password:', testHash);
        console.log(
          'Does test hash match stored?',
          bcrypt.compareSync(req.body.password, testHash)
        );

        return res.status(401).json({
          message: 'Email sau parolă incorectă',
        });
      }

      // 4. Successful login
      console.log('SUCCESSFUL LOGIN for:', user.email);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user),
      });
    } catch (error) {
      // 5. Error handling
      console.error('SIGNIN ERROR:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        message: 'Eroare server la autentificare',
        error: error.message,
      });
    }
  })
);

// Restul routerului rămâne neschimbat
userRouter.post(
  '/signup',
  expressAsyncHandler(async (req, res) => {
    try {
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
    } catch (err) {
      console.error('Signup error:', err);
      res.status(500).json({ message: 'Eroare server la înregistrare' });
    }
  })
);

// Adaugă una PUT pentru profile
userRouter.put(
  '/profile',
  isAuth, // Middleware de autentificare
  expressAsyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: 'Utilizator negăsit' });
      }

      // Actualizează datele utilizatorului
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      // Actualizează parola doar dacă a fost furnizată
      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 8);
      }

      // Salvează utilizatorul actualizat
      const updatedUser = await user.save();

      // Returnează utilizatorul actualizat cu un nou token
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser),
      });
    } catch (error) {
      console.error('Eroare la actualizarea profilului:', error);
      res
        .status(500)
        .json({ message: 'Eroare server la actualizarea profilului' });
    }
  })
);

export default userRouter;
