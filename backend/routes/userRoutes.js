import express from 'express';
import User from '../models/userModel.js';
const userRouter = express.Router();
import bcrypt from 'bcryptjs';
import { generateToken, isAuth } from '../utils.js'; // Adaugă isAuth aici
import expressAsyncHandler from 'express-async-handler';

// Rutele existente rămân neschimbate...

// Adaugă această nouă rută pentru actualizarea profilului
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
