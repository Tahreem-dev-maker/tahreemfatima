// Select elements
const hamburgerBtn = document.getElementById('hamburger-btn');
const mainNav = document.getElementById('main-nav');
const navLinks = mainNav.querySelectorAll('a');

// Toggle menu open/close when hamburger is clicked
hamburgerBtn.addEventListener('click', function () {
    const isOpen = mainNav.classList.toggle('open');
    hamburgerBtn.classList.toggle('open');
    // Update accessibility attribute
    hamburgerBtn.setAttribute('aria-expanded', isOpen);
});

// Bonus: close menu when any nav link is clicked
navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
        mainNav.classList.remove('open');
        hamburgerBtn.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', false);
    });
});
