// Mobile menu toggle
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('mobile-open');
}

// Password protection for pitch page
function checkPassword(event) {
    event.preventDefault();
    
    const password = document.getElementById('passwordInput').value;
    const correctPassword = 'monbe2025';
    const errorElement = document.getElementById('passwordError');
    
    if (password === correctPassword) {
        // Hide password container and show pitch content
        document.getElementById('passwordContainer').style.display = 'none';
        document.getElementById('pitchContent').classList.add('unlocked');
        
        // Store access in session
        sessionStorage.setItem('pitchAccess', 'granted');
    } else {
        // Show error message
        errorElement.classList.add('show');
        document.getElementById('passwordInput').value = '';
        
        // Hide error after 3 seconds
        setTimeout(() => {
            errorElement.classList.remove('show');
        }, 3000);
    }
}

// Check if user already has access when navigating to pitch page
function checkPitchAccess() {
    // Session-based access
    if (sessionStorage.getItem('pitchAccess') === 'granted') {
        const passwordContainer = document.getElementById('passwordContainer');
        const pitchContent = document.getElementById('pitchContent');
        if (passwordContainer && pitchContent) {
            passwordContainer.style.display = 'none';
            pitchContent.classList.add('unlocked');
        }
        return;
    }

    // URL parameter based access (e.g., pitch.html?access=monbe2025)
    const urlParams = new URLSearchParams(window.location.search);
    const accessParam = urlParams.get('access');
    if (accessParam && accessParam === 'monbe2025') {
        sessionStorage.setItem('pitchAccess', 'granted');
        const passwordContainer = document.getElementById('passwordContainer');
        const pitchContent = document.getElementById('pitchContent');
        if (passwordContainer && pitchContent) {
            passwordContainer.style.display = 'none';
            pitchContent.classList.add('unlocked');
        }
        // Clean the URL so the param doesn't persist on refresh/share
        if (window.history && window.history.replaceState) {
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
        }
    }
}

// Form submission handler for contact form
function handleContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const firstName = formData.get('firstName');
            const lastName = formData.get('lastName');
            const email = formData.get('email');
            const message = formData.get('message');
            
            // Simple validation
            if (firstName && lastName && email && message) {
                // Submit to Netlify
                fetch('/', {
                    method: 'POST',
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams(formData).toString()
                })
                .then(() => {
                    alert('Thank you for your message! We\'ll get back to you soon.');
                    this.reset();
                })
                .catch((error) => {
                    alert('Sorry, there was an error sending your message. Please try again.');
                });
            } else {
                // Show exactly which fields are missing
                const missing = [];
                if (!firstName) missing.push('First Name');
                if (!lastName) missing.push('Last Name');
                if (!email) missing.push('Email');
                if (!message) missing.push('Message');
                alert('Please fill in all required fields. Missing: ' + missing.join(', '));
            }
        });
    }
}

// Animation sequence for home page
function startAnimation() {
    const hero = document.querySelector('.hero');
    const brandName = document.getElementById('brandName');
    const tagline = document.getElementById('tagline');
    const connectBtn = document.getElementById('connectBtn');

    if (!hero || !brandName || !tagline || !connectBtn) return;

    // Step 1: After 1 second, start fade out of MonBe and transition background
    setTimeout(function() {
        brandName.classList.add('fade-out');
        hero.classList.add('color-transition');
    }, 1000);

    // Step 2: After 1.5 seconds, fade in the tagline (overlapping with MonBe fade)
    setTimeout(function() {
        tagline.classList.add('fade-in');
    }, 1500);

    // Step 3: After 2.5 seconds, fade in the button
    setTimeout(function() {
        connectBtn.classList.add('fade-in');
    }, 2500);
}

// Initialize page-specific functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check for existing pitch access
    checkPitchAccess();
    
    // Handle contact form
    handleContactForm();
    
    // Start animation sequence for home page after 0.5 seconds
    setTimeout(function() {
        startAnimation();
    }, 500);

    // (Removed QR rendering on-site by request)
});
