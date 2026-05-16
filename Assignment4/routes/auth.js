const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

router.get("/register", (req, res) => {
    res.render('register');
});

router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const newUser = new User({ name, email, password });
        await newUser.save();
        req.flash("success", "Registration successful, please login");
        res.redirect("/login");
    } catch (err) {
        req.flash("error", "Registration failed, please try again");
        res.redirect("/register");
    }
});

router.get("/login", (req, res) => {
    res.render("login");
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const foundUser = await User.findOne({ email });
        if (!foundUser) {
            req.flash("error", "Invalid email or password");
            return res.redirect("/login");
        }
        const isMatch = await bcrypt.compare(password, foundUser.password);
        if (!isMatch) {
            req.flash("error", "Invalid email or password");
            return res.redirect("/login");
        }
        req.session.userId = foundUser._id;
        req.session.role = foundUser.role;
        req.flash("success", `Welcome back, ${foundUser.name}!`);
        res.redirect("/");
    } catch (err) {
        req.flash("error", "Login failed, please try again");
        res.redirect("/login");
    }
});

router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});

module.exports = router;