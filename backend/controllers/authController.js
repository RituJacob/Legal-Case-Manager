//authentication controls 

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register User (with role support)
const registerUser = async (req, res) => {
    const { name, email, password, role, specialization, contactNumber, address } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        // Role validation
        if (role && !['Admin', 'Lawyer', 'Client'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        // Specialization required for lawyers
        if (role === 'Lawyer' && !specialization) {
            return res.status(400).json({ message: 'Specialization is required for lawyers' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'Client', // Default role is Client
            specialization: role === 'Lawyer' ? specialization : undefined,
            contactNumber,
            address
        });

        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            specialization: user.specialization,
            token: generateToken(user.id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login User
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                specialization: user.specialization,
                token: generateToken(user.id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            name: user.name,
            email: user.email,
            role: user.role,
            specialization: user.specialization,
            contactNumber: user.contactNumber,
            address: user.address
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update Profile
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, email, specialization, contactNumber, address } = req.body;
        
        user.name = name || user.name;
        user.email = email || user.email;

        // Only update specialization if user is a lawyer
        if (user.role === 'Lawyer' && specialization) {
            user.specialization = specialization;
        }

        user.contactNumber = contactNumber || user.contactNumber;
        user.address = address || user.address;

        const updatedUser = await user.save();
        res.json({
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            specialization: updatedUser.specialization,
            contactNumber: updatedUser.contactNumber,
            address: updatedUser.address,
            token: generateToken(updatedUser.id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, updateUserProfile, getProfile };
