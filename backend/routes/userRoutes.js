import express from 'express';
import User from '../models/userModel.js';
const userRouter = express.Router();
import bcrypt from 'bcryptjs';
import expressAsyncHandler from 'express-async-handler';
import { generateToken, isAuth, isAdmin } from '../utils.js';

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
        password: bcrypt.hashSync(req.body.password, 8), // Adaugă salt-ul 8
        isAdmin: false, // Adaugă această linie!
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

// Obține toți utilizatorii (doar pentru admin)
userRouter.get('/', isAuth, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.send(users);
  } catch (error) {
    res.status(500).send({ message: 'Server Error: ' + error.message });
  }
});

// Obține un utilizator după ID (doar pentru admin)
userRouter.get('/:id', isAuth, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Server Error: ' + error.message });
  }
});

// Actualizează un utilizator (doar pentru admin)
userRouter.put('/:id', isAuth, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Actualizează câmpurile
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin =
      req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;

    // Dacă se furnizează o parolă nouă, o actualizăm
    if (req.body.password) {
      user.password = bcrypt.hashSync(req.body.password, 8);
    }

    const updatedUser = await user.save();

    res.send({
      message: 'User updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).send({ message: 'Server Error: ' + error.message });
  }
});

// Șterge un utilizator (doar pentru admin)
userRouter.delete('/:id', isAuth, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Verifică dacă se încearcă ștergerea propriului cont sau a contului super admin
    if (user._id.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .send({ message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.send({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Server Error: ' + error.message });
  }
});

userRouter.post('/admin', isAuth, isAdmin, async (req, res) => {
  try {
    // Verifică dacă email-ul este deja utilizat
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).send({
        message: 'Există deja un utilizator cu această adresă de email',
      });
    }

    // Validări simple
    if (!req.body.name || !req.body.email || !req.body.password) {
      return res.status(400).send({
        message: 'Toate câmpurile (nume, email, parolă) sunt obligatorii',
      });
    }

    // Verifică dacă parola are minim 6 caractere
    if (req.body.password.length < 6) {
      return res.status(400).send({
        message: 'Parola trebuie să aibă minim 6 caractere',
      });
    }

    // Creează noul utilizator
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
      isAdmin: req.body.isAdmin || false,
    });

    const user = await newUser.save();

    res.status(201).send({
      message: 'Utilizator creat cu succes',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send({
      message: 'Server Error: ' + error.message,
    });
  }
});

export default userRouter;
