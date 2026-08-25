// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Organization = require('../models/Organization');

// Route 1: Create a new Organization and a User inside it
router.post('/register', async (req, res) => {
    try {
        const { userName, email, orgName } = req.body;

        // 1. Create the Organization first
        const newOrg = await Organization.create({ name: orgName });

        // 2. Create the User and link them to the new Organization's ID
        const newUser = await User.create({
            name: userName,
            email: email,
            organization: newOrg._id
        });

        res.status(201).json({ message: "User and Org created!", user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

// Route 2: Get all users and their organization details
router.get('/', async (req, res) => {
    try {
        // .populate() tells MongoDB to fetch the actual Organization data, not just the ID!
        const users = await User.find().populate('organization');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
});

module.exports = router;