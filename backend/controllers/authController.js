import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'shopez_ultra_secure_jwt_secret_key_2026_abc', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password // user pre-save hook handles hashing
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && !user.blocked && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else if (user && user.blocked) {
      res.status(403).json({ message: 'Account blocked. Contact administration.' });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        addresses: user.addresses,
        recentlyViewed: user.recentlyViewed
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add shipping address
// @route   POST /api/auth/addresses
// @access  Private
export const addUserAddress = async (req, res) => {
  const { type, fullName, phone, street, city, state, zipCode } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const newAddress = {
        type: type || 'Home',
        fullName,
        phone,
        street,
        city,
        state,
        zipCode
      };

      user.addresses.push(newAddress);
      const updatedUser = await user.save();
      res.status(201).json(updatedUser.addresses);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update shipping address
// @route   PUT /api/auth/addresses/:addressId
// @access  Private
export const updateUserAddress = async (req, res) => {
  const { type, fullName, phone, street, city, state, zipCode } = req.body;
  const { addressId } = req.params;

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const address = user.addresses.id(addressId);
      if (!address) {
        return res.status(404).json({ message: 'Address not found' });
      }

      address.type = type || address.type;
      address.fullName = fullName || address.fullName;
      address.phone = phone || address.phone;
      address.street = street || address.street;
      address.city = city || address.city;
      address.state = state || address.state;
      address.zipCode = zipCode || address.zipCode;

      const updatedUser = await user.save();
      res.json(updatedUser.addresses);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete shipping address
// @route   DELETE /api/auth/addresses/:addressId
// @access  Private
export const deleteUserAddress = async (req, res) => {
  const { addressId } = req.params;

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.addresses.pull({ _id: addressId });
      const updatedUser = await user.save();
      res.json(updatedUser.addresses);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sync / Add product to recently viewed list
// @route   POST /api/auth/recently-viewed
// @access  Private
export const addRecentlyViewed = async (req, res) => {
  const { productId } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Filter out existing instances of productId to avoid duplicates
      let viewed = user.recentlyViewed.filter(
        (id) => id.toString() !== productId
      );
      
      // Prepend the new viewed product
      viewed.unshift(productId);

      // Keep only the most recent 10 items
      if (viewed.length > 10) {
        viewed = viewed.slice(0, 10);
      }

      user.recentlyViewed = viewed;
      await user.save();
      
      // Populate and return populated list
      const populatedUser = await User.findById(req.user._id).populate('recentlyViewed');
      res.json(populatedUser.recentlyViewed);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recently viewed products
// @route   GET /api/auth/recently-viewed
// @access  Private
export const getRecentlyViewed = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('recentlyViewed');

    if (user) {
      res.json(user.recentlyViewed);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
