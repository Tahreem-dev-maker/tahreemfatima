const express = require('express');
const app = express();

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Serve static files (CSS, JS, images) from the 'public' folder
app.use(express.static('public'));

// Parse form data from POST requests
app.use(express.urlencoded({ extended: false }));

// HOME route
app.get('/', function (req, res) {
    res.render('index');
});

// CONTACT route
app.get('/contact', function (req, res) {
    res.render('contact');
});

// Handle contact form POST submission
app.post('/contact', function (req, res) {
    const { name, email, message } = req.body;
    console.log('Form submission received:');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Message:', message);
    res.redirect('/contact');
});

// Start the server
app.listen(3000, function () {
    console.log('Server running on http://localhost:3000');
});
